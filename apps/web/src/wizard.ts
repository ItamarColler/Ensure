export type WizardPrerequisite = 'vehicle' | 'coverage';

export type WizardDraftSnapshot = Readonly<
  Partial<Record<WizardPrerequisite, unknown>>
>;

interface WizardStepShape {
  readonly key: string;
  readonly path: string;
  readonly requires: readonly WizardPrerequisite[];
  readonly implemented: boolean;
}

export const wizardSteps = [
  { key: 'vehicle', path: '/vehicle', requires: [], implemented: true },
  {
    key: 'coverage',
    path: '/coverage',
    requires: ['vehicle'],
    implemented: true,
  },
  {
    key: 'quote',
    path: '/quote',
    requires: ['vehicle', 'coverage'],
    implemented: true,
  },
  {
    key: 'register',
    path: '/register',
    requires: ['vehicle', 'coverage'],
    implemented: false,
  },
  {
    key: 'details',
    path: '/details',
    requires: ['vehicle', 'coverage'],
    implemented: false,
  },
  {
    key: 'confirmation',
    path: '/confirmation',
    requires: ['vehicle', 'coverage'],
    implemented: false,
  },
] as const satisfies readonly WizardStepShape[];

export type WizardStep = (typeof wizardSteps)[number];

export type WizardStepKey = WizardStep['key'];

export function stepIndex(pathname: string): number | undefined {
  const index = wizardSteps.findIndex((step) => step.path === pathname);

  return index === -1 ? undefined : index;
}

function stepPathFor(key: WizardPrerequisite): string | undefined {
  return wizardSteps.find((step) => step.key === key)?.path;
}

export function guardRedirectPath(
  pathname: string,
  snapshot: WizardDraftSnapshot,
): string | undefined {
  const index = stepIndex(pathname);

  if (index === undefined) {
    return undefined;
  }

  const step = wizardSteps[index];

  if (step === undefined) {
    return undefined;
  }

  const missing = step.requires.find(
    (requirement) => snapshot[requirement] === undefined,
  );

  return missing === undefined ? undefined : stepPathFor(missing);
}

export function nextStepPath(pathname: string): string | undefined {
  const index = stepIndex(pathname);

  return index === undefined ? undefined : wizardSteps[index + 1]?.path;
}

export function previousStepPath(pathname: string): string | undefined {
  const index = stepIndex(pathname);

  if (index === undefined || index === 0) {
    return undefined;
  }

  return wizardSteps[index - 1]?.path;
}

export const wizardResetPath: string = wizardSteps[0].path;
