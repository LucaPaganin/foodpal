## Frontend Development Guidelines
- We always use the material ui v5 version of Grid component. An example usage is as follows:

```javascript
import Grid from '@mui/material/Grid';

const MyComponent = () => {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        {/* Your content here */}
      </Grid>
    </Grid>
  );
};
```

