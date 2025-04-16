import React from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, Select, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store';
import { setLanguage } from '../../store/slices/uiSlice';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector((state) => state.ui.language);

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    const language = event.target.value as 'en' | 'it';
    i18n.changeLanguage(language);
    dispatch(setLanguage(language));
  };

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel id="language-select-label">{t('settings.language')}</InputLabel>
      <Select
        labelId="language-select-label"
        id="language-select"
        value={currentLanguage}
        label={t('settings.language')}
        onChange={handleLanguageChange}
      >
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="it">Italiano</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcher;
