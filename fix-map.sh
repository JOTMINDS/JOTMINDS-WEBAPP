#!/bin/bash
sed -i '' -e 's/if (kolb && kolb.scores) {/const kolbScores = kolb?.score?.kolb?.scores;\n  if (kolbScores) {/' src/app/components/SupervisorDashboard.tsx
sed -i '' -e 's/learningScore = Math.min(30, Math.round(((kolb.scores.ae || 0) + (kolb.scores.ce || 0)) \* 1.5));/learningScore = Math.min(30, Math.round(((kolbScores.AE || kolbScores.ae || 0) + (kolbScores.CE || kolbScores.ce || 0)) * 1.5));/' src/app/components/SupervisorDashboard.tsx

sed -i '' -e 's/if (sternberg && sternberg.scores) {/const sternbergScores = sternberg?.score?.sternberg?.scores;\n  if (sternbergScores) {/' src/app/components/SupervisorDashboard.tsx
sed -i '' -e 's/thinkingScore = Math.min(30, Math.round(((sternberg.scores.creative || 0) + (sternberg.scores.analytical || 0)) \* 1.5));/thinkingScore = Math.min(30, Math.round(((sternbergScores.creative || 0) + (sternbergScores.analytical || 0)) * 1.5));/' src/app/components/SupervisorDashboard.tsx

sed -i '' -e 's/if (dual && dual.scores) {/const dualScores = dual?.score?.dualProcess?.scores;\n  if (dualScores) {/' src/app/components/SupervisorDashboard.tsx
sed -i '' -e 's/decisionScore = Math.min(30, Math.round((dual.scores.system2 || 0) \* 1.5));/decisionScore = Math.min(30, Math.round((dualScores.system2 || 0) * 1.5));/' src/app/components/SupervisorDashboard.tsx
