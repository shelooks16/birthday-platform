import { Tooltip, TooltipOptions } from '@hope-ui/solid';
import { Show, ParentComponent, splitProps } from 'solid-js';

export type OptionalTooltipProps = {
  showWhen: boolean;
} & TooltipOptions;

export const OptionalTooltip: ParentComponent<OptionalTooltipProps> = (
  props
) => {
  const [localProps, tooltipProps] = splitProps(props, ['showWhen']);

  return (
    <Show when={localProps.showWhen} fallback={tooltipProps.children}>
      <Tooltip {...tooltipProps} />
    </Show>
  );
};

export default OptionalTooltip;
