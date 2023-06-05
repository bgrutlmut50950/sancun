const randomNumber: { [tag: string]: number } = {};
let PRDCalcC = [];
for (let i = 1; i <= 1000; i++) {
    PRDCalcC.push(i / 10000);
}

/**
 * 补偿随机算法
 * @param tag 随机标签
 * @param chance 此次随机的触发概率（1 - 100）
 * @returns 若随机成功，则返回 true；否则返回 false
 * https://zhuanlan.zhihu.com/p/214154376
 */
export function pseudoRandom(tag: string, chance: number): boolean {
    if (chance <= 0) {
        return false;
    }
    if (chance >= 100) {
        return true;
    }
    const c: number = PRDCalcC[Math.ceil(chance * 10)] || 0;

    tag = tag + chance;
    let n: number = randomNumber[tag];
    if (!n) {
        n = 1;
        randomNumber[tag] = n;
    }
    print(c * n * (0.2 * chance + 1));
    if (Math.random() <= c * n * (0.2 * chance + 1)) {
        delete randomNumber[tag];
        return true;
    } else {
        randomNumber[tag] = n + 0.618;
        return false;
    }
}
