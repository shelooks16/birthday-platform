import { Container, Heading, Button } from '@hope-ui/solid';
import { A } from '@solidjs/router';
import { Component } from 'solid-js';
import PageTitle from '../components/PageTitle';
import { useI18n } from '../i18n.context';
import { ROUTE_PATH } from '../routes';

const NotFoundPage: Component = () => {
  const [i18n] = useI18n();

  return (
    <Container px="$3" py="$10" textAlign="center">
      <PageTitle>{i18n().t('pages.404.title')}</PageTitle>
      <Heading size="xl" mb="$5">
        Oops, page not found
      </Heading>
      <Button as={A} href={ROUTE_PATH.index}>
        Go to home
      </Button>
    </Container>
  );
};

export default NotFoundPage;
