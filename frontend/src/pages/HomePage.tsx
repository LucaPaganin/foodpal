import React from 'react';
import { 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea,
  CardMedia, 
  Box, 
  Button,
  Paper
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import KitchenIcon from '@mui/icons-material/Kitchen';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}> = ({ title, description, icon, path }) => {
  return (
    <Grid size={{xs: 12, sm: 6, md: 3}}>
      <Card 
        elevation={3} 
        sx={{ 
          height: '100%',
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.03)',
          }
        }}
      >
        <CardActionArea 
          component={RouterLink} 
          to={path}
          sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            {icon}
          </Box>
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography gutterBottom variant="h5" component="div" align="center">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
};

const HomePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Hero Section */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          textAlign: 'center',
          backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to FoodPal
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Your personal assistant for meal planning, recipes, and grocery shopping
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          component={RouterLink} 
          to="/meals"
          sx={{ mt: 2 }}
        >
          Start Planning Meals
        </Button>
      </Paper>

      {/* Features Section */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 6, mb: 4, textAlign: 'center' }}>
        Plan, Cook, and Shop with Ease
      </Typography>
      
      <Grid container spacing={4}>
        <FeatureCard 
          title="Meal Planning" 
          description="Create weekly meal plans, schedule your favorite recipes and generate automated shopping lists."
          icon={<MenuBookIcon sx={{ fontSize: 60, color: 'primary.main' }} />}
          path="/meals"
        />
        
        <FeatureCard 
          title="Recipe Management" 
          description="Store, organize and discover recipes. Track nutrition information and cooking times."
          icon={<RestaurantMenuIcon sx={{ fontSize: 60, color: 'primary.main' }} />}
          path="/recipes"
        />
        
        <FeatureCard 
          title="Ingredient Tracking" 
          description="Keep an inventory of your pantry items and reduce food waste by using what you already have."
          icon={<KitchenIcon sx={{ fontSize: 60, color: 'primary.main' }} />}
          path="/ingredients"
        />
        
        <FeatureCard 
          title="Shopping Lists" 
          description="Generate smart shopping lists based on your meal plans and current inventory."
          icon={<ShoppingBasketIcon sx={{ fontSize: 60, color: 'primary.main' }} />}
          path="/shopping"
        />
      </Grid>
    </Container>
  );
};

export default HomePage;
