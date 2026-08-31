const EXCLUDED_TARGET_BRANCHES = new Set(["main"]);

export function isExcludedTarget(branch) {
  return EXCLUDED_TARGET_BRANCHES.has(String(branch).trim().toLowerCase());
}

export function partitionTargets(targets) {
  const included = [];
  const excluded = [];
  for (const target of targets) {
    if (isExcludedTarget(target)) excluded.push(target);
    else included.push(target);
  }
  return { included, excluded };
}
