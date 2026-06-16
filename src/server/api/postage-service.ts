import type { Postage } from "./domain";
import { ApiError } from "./errors";
import {
  checkAccountLimit,
  checkIpLimit,
  checkRelayLimit,
  checkSenderRecipientLimit,
} from "./abuse-service";
import { getMailboxPolicy } from "./policy-service";
import type { ApiRepository } from "./repository";

export async function quotePostage(
  repository: ApiRepository,
  input: { recipient: string; sender: string },
) {
  const rule = await repository.getSenderRule(input.recipient, input.sender);
  const { policy } = await getMailboxPolicy(repository, input.recipient);

  if (rule === "block") {
    return {
      amount: policy.minimumPostage,
      eligible: false,
      reason: "sender_blocked" as const,
      trusted: false,
    };
  }

  const trusted = rule === "allow";
  return {
    amount: trusted ? "0" : policy.minimumPostage,
    eligible: true,
    reason: trusted ? ("trusted_sender" as const) : ("mailbox_minimum" as const),
    trusted,
  };
}

export async function submitPostage(
  repository: ApiRepository,
  input: Omit<Postage, "createdAt" | "status">,
  now = new Date(),
  context: { ip?: string; relayId?: string } = {},
) {
  const accountLimit = await checkAccountLimit(repository, input.sender);
  if (!accountLimit.allowed) {
    throw new ApiError(429, "rate_limited", "Account limit exceeded", {
      retryAfterSeconds: accountLimit.retryAfterSeconds,
    });
  }

  const ipLimit = await checkIpLimit(repository, context.ip ?? "unknown");
  if (!ipLimit.allowed) {
    throw new ApiError(429, "rate_limited", "IP limit exceeded", {
      retryAfterSeconds: ipLimit.retryAfterSeconds,
    });
  }

  const senderRecipientLimit = await checkSenderRecipientLimit(
    repository,
    input.sender,
    input.recipient,
  );
  if (!senderRecipientLimit.allowed) {
    throw new ApiError(429, "rate_limited", "Sender-recipient limit exceeded", {
      retryAfterSeconds: senderRecipientLimit.retryAfterSeconds,
    });
  }

  if (context.relayId && context.relayId !== "") {
    const relayLimit = await checkRelayLimit(repository, context.relayId);
    if (!relayLimit.allowed) {
      throw new ApiError(429, "rate_limited", "Relay limit exceeded", {
        retryAfterSeconds: relayLimit.retryAfterSeconds,
      });
    }
  }

  if (await repository.getPostage(input.messageId)) {
    throw new ApiError(409, "conflict", "Postage already exists for this message");
  }

  const rule = await repository.getSenderRule(input.recipient, input.sender);
  if (rule === "block") {
    throw new ApiError(403, "forbidden", "The recipient has blocked this sender");
  }

  const { policy } = await getMailboxPolicy(repository, input.recipient);
  if (BigInt(input.amount) < BigInt(policy.minimumPostage)) {
    throw new ApiError(422, "validation_error", "Postage is below the mailbox minimum", {
      minimumPostage: policy.minimumPostage,
    });
  }

  return repository.setPostage({
    ...input,
    createdAt: now.toISOString(),
    status: "pending",
  });
}

export async function getPostage(repository: ApiRepository, messageId: string) {
  const postage = await repository.getPostage(messageId);
  if (!postage) {
    throw new ApiError(404, "not_found", "Postage was not found");
  }
  return postage;
}

export function assertPostageParticipant(postage: Postage, actor: string) {
  if (actor !== postage.sender && actor !== postage.recipient) {
    throw new ApiError(403, "forbidden", "Only message participants can read this postage");
  }
}

export async function resolvePostage(
  repository: ApiRepository,
  messageId: string,
  status: "refunded" | "settled",
) {
  const postage = await getPostage(repository, messageId);
  if (postage.status !== "pending") {
    throw new ApiError(409, "conflict", "Postage has already been resolved", {
      status: postage.status,
    });
  }

  return repository.setPostage({ ...postage, status });
}
