// src/pages/InfoPreviewComponent.tsx

import React from 'react';
import { Button, Typography } from '@mui/material';
import ImageWithFallback from './ImageWithFallback';
import { normalizeImagePath } from './pathUtils';
import { useTranslation } from 'react-i18next';

interface InfoPreviewProps {
  selectedNodeInfo: any;
  onEdit: () => void;
  onAdd: () => void;
}

const InfoPreviewComponent: React.FC<InfoPreviewProps> = ({
  selectedNodeInfo,
  onEdit,
  onAdd,
}) => {
  const { t } = useTranslation();

  if (!selectedNodeInfo) {
    return (
      <Typography variant="body1">{t('infoPreview.selectNode') || 'لم يتم اختيار عنصر'}</Typography>
    );
  }

  // Normalize image path
  const imagePath = selectedNodeInfo.img ? normalizeImagePath(selectedNodeInfo.img) : null;
  const imageUrl = imagePath ? `https://erp.ts-egy.com${imagePath}` : null;

  // Debugging: Log the image URL
  console.log(
    `Image URL for node ${selectedNodeInfo.screenName || selectedNodeInfo.groupName}:`,
    imageUrl
  );

  // تعيين الألوان الافتراضية إذا كانت غير محددة
  const backgroundColor = selectedNodeInfo.color || '#FFFFFF'; // الأبيض
  const textColor = selectedNodeInfo.textColor || '#8B4513'; // بني

  return (
    <div
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
        padding: '1em',
        borderRadius: '8px',
      }}
    >
      <Typography variant="h6">
        {selectedNodeInfo.groupName || selectedNodeInfo.screenName}
      </Typography>
      {/* عرض معلومات إضافية بناءً على نوع العنصر */}
      {selectedNodeInfo.screenName ? (
        <>
          <Typography>
            <strong>{t('posScreen.screenName') || 'اسم الشاشة'}:</strong> {selectedNodeInfo.screenName}
          </Typography>
          {selectedNodeInfo.parentScreenName && (
            <Typography>
              <strong>{t('posScreen.parentScreen') || 'الشاشة الأم'}:</strong> {selectedNodeInfo.parentScreenName}
            </Typography>
          )}
        </>
      ) : (
        <>
          <Typography>
            <strong>{t('productGroups.groupName') || 'اسم المجموعة'}:</strong> {selectedNodeInfo.groupName}
          </Typography>
          {selectedNodeInfo.parentGroupName && (
            <Typography>
              <strong>{t('productGroups.parentGroup') || 'المجموعة الأم'}:</strong> {selectedNodeInfo.parentGroupName}
            </Typography>
          )}
        </>
      )}
      <Typography>
        <strong>{t('common.color') || 'لون الخلفية'}:</strong>{' '}
        <span
          style={{
            display: 'inline-block',
            width: '20px',
            height: '20px',
            backgroundColor: selectedNodeInfo.color || '#FFFFFF',
            border: '1px solid #000',
            marginLeft: '8px',
          }}
        ></span>
        {` ${selectedNodeInfo.color || '#FFFFFF'}`}
      </Typography>
      <Typography>
        <strong>{t('productGroups.textColor') || 'لون النص'}:</strong>{' '}
        <span
          style={{
            display: 'inline-block',
            width: '20px',
            height: '20px',
            backgroundColor: selectedNodeInfo.textColor || '#8B4513',
            border: '1px solid #000',
            marginLeft: '8px',
          }}
        ></span>
        {` ${selectedNodeInfo.textColor || '#8B4513'}`}
      </Typography>
      {imageUrl && (
        <div>
          <Typography>
            <strong>{t('common.image') || 'الصورة'}:</strong>
          </Typography>
          <ImageWithFallback
            src={imageUrl}
            alt={selectedNodeInfo.screenName || selectedNodeInfo.groupName || t('common.group') || 'مجموعة'}
            style={{ maxWidth: '25%', marginTop: '1em' }}
          />
        </div>
      )}
      {/* الأزرار */}
      <div style={{ marginTop: '1em' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onEdit}
          style={{ marginRight: '1em' }}
        >
          {t('buttons.edit') || 'تعديل'}
        </Button>
        <Button variant="contained" color="secondary" onClick={onAdd}>
          {t('buttons.addNewSubGroup') }
        </Button>
      </div>
    </div>
  );
};

export default InfoPreviewComponent;
