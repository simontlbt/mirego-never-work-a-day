export function toPromise(observer) {
  return new Promise((resolve) => {
    observer.subscribe((value, unsubscribe) => {
      unsubscribe();
      resolve(value);
    });
  });
}

export function observerValue(observer) {
  let value;

  observer.subscribe((value_, unsubscribe) => {
    value = value_;
    unsubscribe();
  });

  return value;
}
