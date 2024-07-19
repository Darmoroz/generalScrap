export class CustomSet extends Set {
	union(otherSet) {
			const resultSet = new CustomSet(this);
			for (const elem of otherSet) {
					resultSet.add(elem);
			}
			return resultSet;
	}

	intersection(otherSet) {
			const resultSet = new CustomSet();
			for (const elem of this) {
					if (otherSet.has(elem)) {
							resultSet.add(elem);
					}
			}
			return resultSet;
	}

	difference(otherSet) {
			const resultSet = new CustomSet(this);
			for (const elem of otherSet) {
					resultSet.delete(elem);
			}
			return resultSet;
	}
}