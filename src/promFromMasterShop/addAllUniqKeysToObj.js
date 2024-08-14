export function addAllKeysToObj(inArr) {
	const keysUniq = new Set();
  inArr.forEach(it => {
    const keys = Object.keys(it);
    keys.forEach(key => {
      if (!keysUniq.has(key)) {
        keysUniq.add(key);
      }
    });
  });
  inArr.forEach(it => {
    [...keysUniq].forEach(key => {
      if (!(key in it)) {
        it[key] = null;
      }
    });
  });
}