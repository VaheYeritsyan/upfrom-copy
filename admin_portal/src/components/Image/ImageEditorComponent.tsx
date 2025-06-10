import React, { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import { Box, Typography, InputLabel, Slider, IconButton, CircularProgress, Tooltip } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import AvatarEditor, { AvatarEditorProps } from 'react-avatar-editor';
import axios from 'axios';
import clsx from 'clsx';
import { ImageCropperShape } from '~/types/image';
import { ImageComponent } from '~/components/Image/ImageComponent';
import { ModalComponent } from '~/components/Modal/ModalComponent';
import { ContainedButtonComponent } from '~/components/Button/ContainedButtonComponent';
import styles from './image-editor.module.scss';

type Props = Omit<AvatarEditorProps, 'image' | 'border'> & {
  className?: string;
  src?: string | null | Blob;
  placeholderText?: string;
  borderVertical?: number;
  borderHorizontal?: number;
  isLoading?: boolean;
  defaultSrc?: string;
  shape?: ImageCropperShape;
  onRemove?: () => void;
  onSave?: (blob: Blob) => void;
};

const shapeStyles = {
  [ImageCropperShape.CIRCLE]: { width: 440, height: 440 },
  [ImageCropperShape.SQUARE]: { width: 440, height: 440 },
  [ImageCropperShape.RECTANGLE]: { width: 440, height: 250 },
};
const shapeBorderRadius = {
  [ImageCropperShape.CIRCLE]: 220,
  [ImageCropperShape.SQUARE]: 0,
  [ImageCropperShape.RECTANGLE]: 0,
};

const inputInlineStyles = { height: 0, width: 0, overflow: 'hidden', color: 'transparent' };
const editorInlineStyles = { width: 440, height: 440 };

const getSource = (src: Props['src']) => {
  return src && typeof src !== 'string' ? URL.createObjectURL(src) : src;
};

export const ImageEditorComponent: FC<Props> = ({
  className,
  src,
  defaultSrc,
  placeholderText = 'No image selected',
  isLoading,
  shape = ImageCropperShape.RECTANGLE,
  onRemove,
  onSave,
  ...props
}) => {
  const editorRef = useRef<AvatarEditor>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isFetching, setIsFetching] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState(getSource(src));
  const [scale, setScale] = useState(1);

  const isEmpty = !src || src === defaultSrc;

  useEffect(() => {
    setSource(getSource(src));
  }, [src]);

  const handleOpenModalClose = () => {
    setFile(null);
  };

  const handleChoseClick = () => {
    if (!inputRef.current) return;

    inputRef.current.value = '';
    inputRef.current.click();
  };

  const handleFileInputChange = ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    setFile(currentTarget.files?.[0] || null);
  };

  const handleSaveClick = async () => {
    if (!editorRef.current) return;

    setIsFetching(true);

    try {
      const dataURL = editorRef.current.getImage().toDataURL();
      const { data } = await axios.get(dataURL, { responseType: 'blob' });

      onSave?.(data);
      setSource(dataURL);
      setFile(null);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleRemoveClick = () => {
    if (!src) {
      setSource(null);
    }

    onRemove?.();
  };

  const handleScaleInputChange = (_: Event, value: number | number[]) => {
    setScale(Array.isArray(value) ? value[0] : value);
  };

  return (
    <>
      <Box
        className={clsx(styles.imageEditor, shape === ImageCropperShape.CIRCLE && styles.imageEditorCircle, className)}>
        {source ? (
          <ImageComponent className={styles.imageEditorImg} src={source || ''} />
        ) : (
          <>
            <Typography className={styles.imageEditorPlaceholderText} variant="body2">
              {placeholderText}
            </Typography>
          </>
        )}
        <Box className={styles.imageEditorImgControls}>
          {isEmpty || isLoading ? (
            <Tooltip title={isLoading ? 'Loading...' : 'Select image'}>
              <IconButton onClick={handleChoseClick} disabled={isLoading}>
                {isLoading ? (
                  <CircularProgress sx={{ color: 'common.white' }} size={24} />
                ) : (
                  <Edit sx={{ color: 'common.white' }} />
                )}
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Remove image">
              <IconButton onClick={handleRemoveClick}>
                <Delete sx={{ color: 'common.white' }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <input
          style={inputInlineStyles}
          type="file"
          accept=".png, .jpg, .jpeg"
          ref={inputRef}
          onChange={handleFileInputChange}
        />
      </Box>

      <ModalComponent
        className={styles.imageEditorModal}
        title="Cropping image"
        withoutPadding
        isOpen={!!file}
        onClose={handleOpenModalClose}
        buttons={
          <ContainedButtonComponent size="small" isLoading={isFetching} onClick={handleSaveClick}>
            Save
          </ContainedButtonComponent>
        }>
        <AvatarEditor
          style={{ ...editorInlineStyles, ...shapeStyles[shape] }}
          {...props}
          border={8}
          width={shapeStyles[shape].width}
          height={shapeStyles[shape].height}
          borderRadius={shapeBorderRadius[shape]}
          ref={editorRef}
          image={file!}
          scale={scale}
        />

        <Box className={styles.imageEditorModalControls}>
          <InputLabel className={styles.imageEditorModalControlsLabel}>Zoom:</InputLabel>
          <Slider onChange={handleScaleInputChange} min={1} max={50} size="small" />
        </Box>
      </ModalComponent>
    </>
  );
};
