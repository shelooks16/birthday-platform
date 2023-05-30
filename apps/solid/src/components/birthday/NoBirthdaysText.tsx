import { Box, Button, Heading } from '@hope-ui/solid';
import { A } from '@solidjs/router';
import { useI18n } from '../../i18n.context';
import { ROUTE_PATH } from '../../routes';

const NoBirthdaysText = () => {
  const [i18n] = useI18n();

  return (
    <Box textAlign="center">
      <Heading size="lg">{i18n().t('birthday.noBirthdaysFound.title')}</Heading>
      <Box mt="$4">
        <Button variant="solid" as={A} href={ROUTE_PATH.addBirthday}>
          {i18n().t('birthday.noBirthdaysFound.addFirstBirthdayBtn')}
        </Button>
      </Box>
    </Box>
  );
};

export default NoBirthdaysText;
