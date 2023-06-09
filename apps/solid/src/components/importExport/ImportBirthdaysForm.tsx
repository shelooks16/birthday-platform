/* eslint-disable solid/no-innerhtml */
import { Component, createSignal, Show, For } from 'solid-js';
import { Box, Button, Input, ListItem, UnorderedList } from '@hope-ui/solid';
import { BirthdayDocument, BirthdayImportExport } from '@shared/types';
import * as yup from 'yup';
import { birthdayService } from '../../lib/birthday/birthday.service';
import { birthdayField } from '../../lib/birthday/birthday.validation';
import { useBirthdaysCtx } from '../../lib/birthday/birthdays.context';
import { useI18n } from '../../i18n.context';
import ErrorMessageList from '../error/ErrorMessageList';

const ShowExampleBtn = () => {
  const [i18n] = useI18n();

  const EXAMPLE: BirthdayImportExport[] = [
    {
      buddyName: 'Henry',
      buddyDescription: 'A friend of mine',
      birth: {
        year: 1990,
        month: 0,
        day: 24
      }
    },
    {
      buddyName: 'Garry',
      buddyDescription: 'Man of his word',
      birth: {
        year: 1994,
        month: 11,
        day: 8
      }
    }
  ];

  const [isExample, setIsExample] = createSignal(false);

  return (
    <Box>
      <Button
        onClick={() => setIsExample((p) => !p)}
        colorScheme="neutral"
        variant="subtle"
        size="sm"
      >
        {isExample()
          ? i18n().t('birthday.importBirthdays.exampleImport.hide')
          : i18n().t('birthday.importBirthdays.exampleImport.show')}
      </Button>
      <Show when={isExample()}>
        <Box mb="$3" mt="$2">
          <UnorderedList pl="$2">
            <For
              each={
                i18n().t(
                  'birthday.importBirthdays.exampleImport.rules',
                  {},
                  []
                ) as string[]
              }
            >
              {(item) => <ListItem innerHTML={item} />}
            </For>
          </UnorderedList>
        </Box>
        <Box padding="$2" bg="$neutral3" borderRadius="$sm">
          <Box as="pre" fontSize="12px" overflowX="auto">
            <Box as="code">{JSON.stringify(EXAMPLE, null, 2)}</Box>
          </Box>
        </Box>
      </Show>
    </Box>
  );
};

async function parseJsonFile<T>(file: any) {
  return new Promise<T>((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        resolve(JSON.parse(event.target?.result as any));
      } catch (err) {
        reject(err);
      }
    };
    fileReader.onerror = (error) => reject(error);
    fileReader.readAsText(file);
  });
}

const birthdayImportExportSchema = () =>
  yup
    .array()
    .of(
      yup.object({
        buddyName: birthdayField.buddyName().required(),
        buddyDescription: birthdayField.buddyDescription().optional(),
        birth: yup.object({
          day: birthdayField.birth.day().required(),
          month: birthdayField.birth.month().required(),
          year: birthdayField.birth.year().required()
        })
      })
    )
    .defined();

const validationErrorToFieldErrors = (error: yup.ValidationError): string[] => {
  return error.inner.reduce<string[]>((acc, inner) => {
    if (inner.inner?.length > 0) {
      return acc.concat(validationErrorToFieldErrors(inner));
    }

    return acc.concat(inner.errors.map((msg) => `${inner.path}: ${msg}`));
  }, []);
};

type ImportBirthdaysFormProps = {
  onAfterSubmit?: (data: BirthdayDocument[]) => any;
};

const ImportBirthdaysForm: Component<ImportBirthdaysFormProps> = (props) => {
  const [i18n] = useI18n();
  const [, { mutate: mutateBirthdays }] = useBirthdaysCtx();
  const [file, setFile] = createSignal<File>();
  const [importedBirthdays, setImportedBirthdays] =
    createSignal<BirthdayImportExport[]>();
  const [errors, setErrors] = createSignal<string[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);

  const onInputChange = async (
    ev: Event & {
      currentTarget: HTMLInputElement;
      target: HTMLInputElement;
    }
  ) => {
    setErrors([]);
    setImportedBirthdays();

    const f = ev.target.files && ev.target.files[0];

    if (!f) {
      setFile();
      return;
    }

    setFile(f);

    try {
      const importResult = await parseJsonFile<BirthdayImportExport[]>(f);

      const importedBirthdays = await birthdayImportExportSchema().validate(
        importResult,
        {
          stripUnknown: true,
          abortEarly: false
        }
      );

      setImportedBirthdays(importedBirthdays);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors(validationErrorToFieldErrors(err));
      } else {
        setErrors([err.message]);
      }
    }
  };

  const handleImport = async () => {
    const bs = importedBirthdays();

    if (!bs) return;

    setIsLoading(true);

    try {
      const birthdays = await birthdayService.importBirthdays(bs);

      mutateBirthdays((p) => (p ? p.concat(birthdays) : p));
      props.onAfterSubmit?.(birthdays);
    } catch (err) {
      setErrors([err.message]);
    }

    setIsLoading(false);
  };

  return (
    <Box>
      <Box mb="$5">
        <ShowExampleBtn />
      </Box>
      <Box mb="$3">
        <Box
          position="relative"
          p="$5"
          border="1px dashed $neutral8"
          borderColor={errors().length > 0 ? '$danger10' : undefined}
          color={errors().length > 0 ? '$danger10' : '$neutral10'}
          borderRadius="$sm"
        >
          <Input
            type="file"
            onChange={onInputChange}
            position="absolute"
            top="0"
            left="0"
            bottom="0"
            right="0"
            w="100%"
            h="100%"
            p={0}
            m={0}
            opacity={0}
          />
          <Show
            when={file()}
            fallback={
              <Box textAlign="center">
                {i18n().t('birthday.importBirthdays.form.file.label')}
              </Box>
            }
          >
            <Box
              css={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
            >
              {file()?.name}
            </Box>
          </Show>
        </Box>
      </Box>

      <Show when={errors().length > 0}>
        <ErrorMessageList errors={errors().slice(0, 10)} mb="$2" />
      </Show>

      <Show when={importedBirthdays()}>
        <Box fontSize="$lg">
          {i18n().t('birthday.importBirthdays.form.toBeImported.title', {
            count: importedBirthdays()!.length
          })}
        </Box>
        <Box fontSize="$sm" color="$neutral10">
          {importedBirthdays()!
            .slice(0, 3)
            .map((b) => b.buddyName)
            .concat(
              importedBirthdays()!.length >= 3
                ? [
                    i18n().t(
                      'birthday.importBirthdays.form.toBeImported.andMore'
                    )
                  ]
                : []
            )
            .join(', ')}
        </Box>

        <Button mt="$4" onClick={handleImport} loading={isLoading()}>
          {i18n().t('birthday.importBirthdays.form.submitBtn')}
        </Button>
      </Show>
    </Box>
  );
};

export default ImportBirthdaysForm;
