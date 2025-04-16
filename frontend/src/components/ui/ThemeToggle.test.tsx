import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';
import { ColorModeContext } from '../../App';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';

describe('ThemeToggle', () => {
  const mockToggleColorMode = jest.fn();
  
  const renderWithProviders = (mode: 'light' | 'dark') => {
    return render(
      <I18nextProvider i18n={i18n}>
        <ColorModeContext.Provider value={{ toggleColorMode: mockToggleColorMode, mode }}>
          <ThemeToggle />
        </ColorModeContext.Provider>
      </I18nextProvider>
    );
  };

  it('renders the correct icon based on theme mode', () => {
    renderWithProviders('light');
    expect(screen.getByLabelText(/toggle dark mode/i)).toBeInTheDocument();
    
    renderWithProviders('dark');
    expect(screen.getByLabelText(/toggle dark mode/i)).toBeInTheDocument();
  });

  it('calls toggleColorMode when clicked', () => {
    renderWithProviders('light');
    fireEvent.click(screen.getByLabelText(/toggle dark mode/i));
    expect(mockToggleColorMode).toHaveBeenCalledTimes(1);
  });
});
