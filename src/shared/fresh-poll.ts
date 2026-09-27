const keyOf = (pollId: string) => `fresh-poll:${pollId}`;

export function markFreshPoll(pollId: string) {
  sessionStorage.setItem(keyOf(pollId), "");
}

export function isFreshPoll(pollId: string) {
  return sessionStorage.getItem(keyOf(pollId)) !== null;
}

export function forgetFreshPoll(pollId: string) {
  sessionStorage.removeItem(keyOf(pollId));
}
