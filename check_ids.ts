import { teachingStyleQuestions } from './src/app/utils/teachingStyleQuestions.ts';

const pools = {
    authorityPos: [7, 18, 20, 22, 24, 93, 94, 96, 97, 99, 100, 101, 103, 104, 106, 162],
    authorityNeg: [1, 2, 6, 17, 19, 21, 23, 95, 98, 102, 105, 143, 158],
    knowledgePos: [11, 12, 13, 15, 16, 92, 163],
    knowledgeNeg: [9, 10, 14, 91, 130],
    assessmentPos: [34, 35, 36, 38, 40, 121, 122, 124, 125, 126, 128, 129, 131, 132, 133, 138, 146, 150],
    assessmentNeg: [33, 37, 39, 123, 127],
    climatePos: [50, 51, 53, 54, 55, 137, 155, 156, 157, 159],
    climateNeg: [49, 52, 56, 148],
    adaptPos: [42, 43, 44, 45, 47, 48, 107, 108, 110, 111, 112, 114, 115, 117, 118, 119, 120, 134, 144, 160],
    adaptNeg: [41, 46, 109, 113, 116, 140, 141, 145],
    motivationAll: [25, 26, 27, 28, 29, 30, 31, 32, 161, 164],
    innovationAll: [57, 58, 59, 60, 61, 62, 63, 64, 135, 136, 139, 142, 147, 149, 151, 152, 153, 154]
};

let missing = [];
for (const key in pools) {
    for (const id of pools[key]) {
        if (!teachingStyleQuestions.find(q => q.id === id)) {
            missing.push(id);
        }
    }
}

if (missing.length > 0) {
    console.log("Missing IDs:", missing);
} else {
    console.log("All IDs exist.");
}
