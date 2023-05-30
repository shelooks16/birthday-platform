import { Box, Button } from '@hope-ui/solid';
import { useNavigate } from '@solidjs/router';
import { useI18n } from '../../i18n.context';
import { usePreviewModeCtx } from '../../lib/previewMode/preview-mode.context';
import { ROUTE_PATH } from '../../routes';

const EnterPreviewModeFloatingBar = () => {
  const [i18n] = useI18n();
  const [, { enablePreviewMode }] = usePreviewModeCtx();
  const navigate = useNavigate();

  const handleEnterPreview = () => {
    enablePreviewMode();
    navigate(ROUTE_PATH.birthday);
  };

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      width="100%"
      textAlign="center"
      py="$8"
      px="$3"
      bg="$background"
    >
      <Box mb="$2" fontSize="$sm" color="$neutral12">
        {i18n().t('previewMode.enterPreview.title')}
      </Box>
      <Button
        maxW="100%"
        variant="ghost"
        colorScheme="primary"
        onClick={handleEnterPreview}
      >
        {i18n().t('previewMode.enterPreview.btn')}
      </Button>
    </Box>
  );
};

export default EnterPreviewModeFloatingBar;
