export const sleep = (msec: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, msec);
  });
}
