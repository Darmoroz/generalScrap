export function getUniqObjByKey(array, key) {
	const seen = new Set();
	return array.filter(item => {
			const keyValue = item[key];
			if (!seen.has(keyValue)) {
					seen.add(keyValue);
					return true;
			}
			return false;
	});
}