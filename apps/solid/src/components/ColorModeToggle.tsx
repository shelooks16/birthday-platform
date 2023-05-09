import { Component } from 'solid-js';
import { IconButton, useColorMode, useColorModeValue } from '@hope-ui/solid';
import { IconMoon, IconSun } from './Icons';

type ColorModeToggleProps = {
  id?: string;
};

const ColorModeToggle: Component<ColorModeToggleProps> = (props) => {
  const { toggleColorMode } = useColorMode();
  const colorModeButtonIcon = useColorModeValue(<IconMoon />, <IconSun />);

  return (
    <IconButton
      id={props.id}
      aria-label="Toggle color mode"
      variant="ghost"
      colorScheme="neutral"
      size="sm"
      fontSize="$lg"
      icon={colorModeButtonIcon}
      onClick={toggleColorMode}
    />
  );
};

export default ColorModeToggle;
