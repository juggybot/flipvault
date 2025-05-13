import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box } from '@mui/material';

const ProductList = ({ products, onDelete, onScrape }) => {
  
    return (
      <TableContainer component={Paper}>
      <Table>
        <TableHead>
        <TableRow>
          <TableCell><Typography variant="h6">Product Name</Typography></TableCell>
          <TableCell align="right"><Typography variant="h6">Actions</Typography></TableCell>
        </TableRow>
        </TableHead>
        <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
          <TableCell>
            <Typography variant="body1">{product.name}</Typography>
          </TableCell>
          <TableCell align="right">
            <Button
            onClick={() => onScrape(product.id)}
            variant="contained"
            color="primary"
            sx={{ mr: 1 }}
            >
            Scrape
            </Button>
            <Button
            onClick={() => onDelete(product.id)}
            variant="contained"
            color="error"
            >
            Delete
            </Button>
          </TableCell>
          </TableRow>
        ))}
        </TableBody>
      </Table>
      </TableContainer>
    );
};

export default ProductList;