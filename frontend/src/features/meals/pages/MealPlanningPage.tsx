import React from 'react';
import { Container, Typography, Box, Tabs, Tab } from '@mui/material';
import { useTranslation } from 'react-i18next';

import WeeklyMealPlanner from '../components/WeeklyMealPlanner';
import MealManager from '../components/MealManager';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`meal-tabpanel-${index}`}
      aria-labelledby={`meal-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `meal-tab-${index}`,
    'aria-controls': `meal-tabpanel-${index}`,
  };
};

const MealPlanningPage: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" sx={{ my: 3 }}>
        {t('Meal Planning')}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="meal planning tabs"
        >
          <Tab label={t('Weekly Planner')} {...a11yProps(0)} />
          <Tab label={t('Meal Library')} {...a11yProps(1)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <WeeklyMealPlanner />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <MealManager />
      </TabPanel>
    </Container>
  );
};

export default MealPlanningPage;
