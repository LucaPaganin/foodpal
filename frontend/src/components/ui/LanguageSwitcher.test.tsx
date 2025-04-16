import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import LanguageSwitcher from './LanguageSwitcher';

describe('LanguageSwitcher Component', () => {
  test('renders language switcher component', () => {
    render(
      <Provider store={store}>
        <LanguageSwitcher />
      </Provider>
    );
    
    // Check that the component renders with the settings.language label
    const languageElement = screen.getByLabelText(/settings.language/i);
    expect(languageElement).toBeInTheDocument();
  });
});
