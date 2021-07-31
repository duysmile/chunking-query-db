exports.countMessage = (count, bot) => {
    if (!count[bot]) {
        count[bot] = 0;
    }

    count[bot] += 1;
    return count;
};
