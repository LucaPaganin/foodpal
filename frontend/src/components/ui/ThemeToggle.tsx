import React from 'react';
import { useContext } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTranslation } from 'react-i18next';
import { ColorModeContext } from '../../App';

const ThemeToggle = () => {
  const { t } = useTranslation();
  const colorMode = useContext(ColorModeContext);
  const isDark = colorMode.mode === 'dark';

  return (
    <Tooltip title={isDark ? t('settings.darkMode') + ' ' + t('common.on') : t('settings.darkMode') + ' ' + t('common.off')}>
      <IconButton
        onClick={colorMode.toggleColorMode}
        color="inherit"
        aria-label={t('settings.darkMode') || 'Toggle dark mode'}
      >
        {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
