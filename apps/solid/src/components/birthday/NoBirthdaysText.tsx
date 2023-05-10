import { Box, Button, Heading } from '@hope-ui/solid';
import { A } from '@solidjs/router';
import { ROUTE_PATH } from '../../routes';

const NoBirthdaysText = () => {
  return (
    <Box textAlign="center">
      <Heading size="lg">You have no birthdays added</Heading>
      <Box mt="$4">
        <Button variant="solid" as={A} href={ROUTE_PATH.addBirthday}>
          Add your first birthday
        </Button>
      </Box>
    </Box>
  );
};

export default NoBirthdaysText;
