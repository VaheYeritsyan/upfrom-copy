import React, { FC } from 'react';
import { Control, Controller, RegisterOptions } from 'react-hook-form';
import { ImageCropperShape } from '~/types/image';
import { InputComponent } from '~/components/Input/InputComponent';
import { ImageEditorComponent } from '~/components/Image/ImageEditorComponent';
import { DateTimeInputComponent } from '~/components/Input/DateTimeInputComponent';
import { eventValuesRules, EventFormValues } from '~/util/validation';

export type MainFormArgs = Pick<EventFormValues, 'title' | 'description' | 'startsAt' | 'endsAt'> & {
  image?: Blob | null;
};

type Props = {
  control: Control<MainFormArgs>;
  imageClassName?: string;
};

export const CreateEventMainFormComponent: FC<Props> = ({ control, imageClassName }) => (
  <>
    <Controller
      name="image"
      control={control}
      render={({ field }) => (
        <ImageEditorComponent
          src={field.value}
          className={imageClassName}
          onRemove={() => field.onChange(null)}
          shape={ImageCropperShape.RECTANGLE}
          onSave={field.onChange}
        />
      )}
    />

    <InputComponent
      control={control}
      name="title"
      label="Title"
      size="small"
      variant="outlined"
      type="text"
      placeholder="Title"
      rules={eventValuesRules.title as RegisterOptions<MainFormArgs>}
    />
    <InputComponent
      control={control}
      name="description"
      label="Description"
      size="small"
      variant="outlined"
      multiline
      minRows={2}
      maxRows={4}
      placeholder="Description"
      rules={eventValuesRules.description as RegisterOptions<MainFormArgs>}
    />
    <DateTimeInputComponent
      control={control}
      name="startsAt"
      label="Starts At"
      size="small"
      variant="outlined"
      rules={eventValuesRules.startsAt as RegisterOptions<MainFormArgs>}
    />
    <DateTimeInputComponent
      control={control}
      name="endsAt"
      label="Ends At"
      size="small"
      variant="outlined"
      rules={eventValuesRules.endsAt as RegisterOptions<MainFormArgs>}
    />
  </>
);
