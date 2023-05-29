import { Box, Progress, ProgressIndicator } from '@hope-ui/solid';
import { IconLogoLoader } from './Icons';

const LogoLoader = () => {
  return (
    <Box textAlign="center">
      <IconLogoLoader boxSize={80} color="$primary10" />
      <Box mt="$2">
        <Progress size="xs" indeterminate>
          <ProgressIndicator color="$primary10" />
        </Progress>
      </Box>
    </Box>
  );
};

export default LogoLoader;
