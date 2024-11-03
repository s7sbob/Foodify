import { useTheme } from '@mui/material/styles';
import { Card, CardHeader, Tooltip, Divider, IconButton, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { IconDownload } from '@tabler/icons-react';
import { t } from 'i18next';

const DownloadCard = ({ title, children, onDownload, searchComponent }: any) => {
  const customizer = useSelector((state: any) => state.customizer);

  const theme = useTheme();
  const borderColor = theme.palette.divider;

  return (
    <Card
      sx={{ padding: 0, border: !customizer.isCardShadow ? `1px solid ${borderColor}` : 'none' }}
      elevation={customizer.isCardShadow ? 9 : 0}
      variant={!customizer.isCardShadow ? 'outlined' : undefined}
    >
      <CardHeader
        sx={{
          padding: '16px',
        }}
        title={
          <Box display="flex" alignItems="center">
            {title}
            {/* Render search input next to the title */}
            <Box ml={2}>{searchComponent}</Box>
          </Box>
        }
        action={
          <Tooltip title={t("Download")} placement="left">
            <IconButton onClick={onDownload}>
              <IconDownload />
            </IconButton>
          </Tooltip>
        }
      />
      <Divider />
      {children}
    </Card>
  );
};

export default DownloadCard;
