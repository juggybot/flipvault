import React, { useState } from 'react';
import { TextField, Button, Typography, Paper, Box } from '@mui/material';

const ProductForm = ({ onCreate }) => {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name === '' || imageUrl === '') {
      alert('Please fill in all fields');
      return;
    }
    onCreate({ name, imageUrl }); // Ensure key names match backend schema
    setName('');
    setImageUrl('');
  };

  return (
    <Paper 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ maxWidth: 400, mx: 'auto', p: 2, borderRadius: 1, backgroundColor: 'background.paper' }}
    >
      <Typography 
        variant="h4" 
        component="h2" 
        sx={{ textAlign: 'center', mb: 2 }}
      >
        Add Product
      </Typography>
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        gap={2}
      >
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="outlined"
          fullWidth
          required
        />
        <TextField
          label="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          variant="outlined"
          fullWidth
          required
        />
      </Box>
      <Button 
        type="submit" 
        variant="contained" 
        color="primary" 
        sx={{ width: '100%', py: 1.5, borderRadius: 1, fontWeight: 'bold', cursor: 'pointer', mt: 2 }}
      >
        Add Product
      </Button>
    </Paper>
  );
};

export default ProductForm;