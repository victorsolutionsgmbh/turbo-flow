export function rangeWithDots(current, total) {
    const delta = 2;
    const left = current - delta;
    const right = current + delta;
    const result = [];

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= left && i <= right)) {
            result.push(i);
        } else if (result[result.length - 1] !== "...") {
            result.push("...");
        }
    }

    return result;
}
