import type {
  AnimationSequenceExportRecord,
  AnimationSequenceExportView,
  AnimationSequenceRun,
  AnimationSequenceRunView,
} from '../../../packages/shared/src';

export function toAnimationSequenceExportView(
  record: AnimationSequenceExportRecord,
): AnimationSequenceExportView {
  const { path: _path, ...view } = record;
  return view;
}

export function toAnimationSequenceRunView(run: AnimationSequenceRun): AnimationSequenceRunView {
  return {
    id: run.id,
    title: run.title,
    status: run.status,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
    contract: run.contract,
    framePlan: run.framePlan,
    frames: run.frames.map(
      ({ promptPath: _promptPath, rawPath: _rawPath, framePath: _framePath, ...frame }) => frame,
    ),
    exports: run.exports.map(toAnimationSequenceExportView),
    qa: run.qa,
  };
}
