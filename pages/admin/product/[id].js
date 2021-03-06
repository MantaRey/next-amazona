/*
  Admin Products Page -- /admin/product/[id]
  Admin can Edit the details of a specific Product
  *Used for both Updating an already existing Product and a newly created Product
*/

import {
  Button,
  Card,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@material-ui/core';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LinkIcon from '@mui/icons-material/Link';
import NumbersIcon from '@mui/icons-material/Numbers';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import axios from 'axios';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import { useReducer } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Layout from '../../../components/Layout';
import { getError } from '../../../utils/error';
import { Store } from '../../../utils/store';
import useStyles from '../../../utils/styles';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, product: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true, errorUpdate: '' };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false, errorUpdate: '' };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false, errorUpdate: action.payload };
    case 'UPLOAD_REQUEST':
      if (action.imageField == 'image') {
        return { ...state, loadingUploadImage: true, errorUpdate: '' };
      }
      return { ...state, loadingUploadFeaturedImage: true, errorUpdate: '' };
    case 'UPLOAD_SUCCESS':
      if (action.imageField == 'image') {
        return {
          ...state,
          loadingUploadImage: false,
          image: action.payload,
          errorUpload: '',
        };
      }
      return {
        ...state,
        loadingUploadFeaturedImage: false,
        featuredImage: action.payload,
        errorUpload: '',
      };
    case 'UPLOAD_FAIL':
      return {
        ...state,
        loadingUploadImage: false,
        loadingUploadFeaturedImage: false,
        errorUpload: action.payload,
      };
    default:
      return state;
  }
}

const ProductEdit = ({ params }) => {
  const productId = params.id;
  const { state } = useContext(Store);
  const [
    {
      loading,
      product,
      image,
      featuredImage,
      error,
      loadingUpdate,
      loadingUploadImage,
      loadingUploadFeaturedImage,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    product: {},
    image: '',
    featuredImage: '',
    error: '',
    loadingUpdate: false,
  });
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();
  const router = useRouter();
  const { userInfo } = state;
  const classes = useStyles();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (!userInfo) {
      return router.push('/login');
    }
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/products/${productId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        //AJAX request ^
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [userInfo, productId, router]);

  //If product is not empty (fetching data is successful), use contents from database to pre-fill form fields with original data
  useEffect(() => {
    if (product) {
      setValue('name', product.name ? product.name : '');
      setValue('slug', product.slug ? product.slug : '');
      setValue('price', product.price ? product.price : '');
      setValue('image', product.image ? product.image : '');
      setValue(
        'featuredImage',
        product.featuredImage ? product.featuredImage : ''
      );
      setIsFeatured(product.isFeatured);
      setValue('category', product.category ? product.category : '');
      setValue('brand', product.brand ? product.brand : '');
      setValue(
        'countInStock',
        product.countInStock ? product.countInStock : ''
      );
      setValue('description', product.description ? product.description : '');
    }
  }, [setValue, product]);

  useEffect(() => {
    if (image != '') {
      setValue('image', image);
    }
    if (featuredImage != '') {
      setValue('featuredImage', featuredImage);
    }
  }, [setValue, image, featuredImage]);

  //Initiates the uploading of a new file (image) for the product by involking an api. Upon success, the image field is set to the url recieved from Cloudinary
  //If imageField parameter is null, default to 'image'
  const uploadHandler = async (e, imageField = 'image') => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    //bodyFormData contains the file to upload
    try {
      dispatch({ type: 'UPLOAD_REQUEST', imageField: imageField });
      const { data } = await axios.post('/api/admin/upload', bodyFormData, {
        headers: {
          'Content-Type': 'mulitpart/form-data',
          authorization: `Bearer ${userInfo.token}`,
        },
      });
      //Content-Type setting allows sending a file through AJAX request
      dispatch({
        type: 'UPLOAD_SUCCESS',
        payload: data.secure_url,
        imageField: imageField,
      });
      enqueueSnackbar('File uploaded successfully', { variant: 'success' });
    } catch (err) {
      dispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
      enqueueSnackbar(getError(err, { variant: 'error' }));
    }
  };

  //Function used to initiate Admin request to Update an already existing or new Product.
  const submitHandler = async ({
    name,
    slug,
    price,
    category,
    image,
    featuredImage,
    brand,
    countInStock,
    description,
  }) => {
    closeSnackbar();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(
        `/api/admin/products/${productId}`,
        {
          name,
          slug,
          price,
          category,
          image,
          isFeatured,
          featuredImage,
          brand,
          countInStock,
          description,
        },
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      );
      dispatch({ type: 'UPDATE_SUCCESS' });
      enqueueSnackbar('Product Successfully Updated', { variant: 'success' });
      router.push('/admin/products');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(err) });
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  };

  return (
    <Layout title={`Edit Product ${productId}`}>
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <List>
            <NextLink href="/admin/dashboard" passHref>
              <ListItem button component="a">
                <ListItemText primary="Admin Dashboard"></ListItemText>
              </ListItem>
            </NextLink>
            <NextLink href="/admin/orders" passHref>
              <ListItem button component="a">
                <ListItemText primary="Orders"></ListItemText>
              </ListItem>
            </NextLink>
            <NextLink href="/admin/products" passHref>
              <ListItem selected button component="a">
                <ListItemText primary="Products"></ListItemText>
              </ListItem>
            </NextLink>
            <NextLink href="/admin/users" passHref>
              <ListItem button component="a">
                <ListItemText primary="Users"></ListItemText>
              </ListItem>
            </NextLink>
          </List>
        </Grid>
        <Grid item md={9} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h1" variant="h1">
                  Edit Product {productId}
                </Typography>
              </ListItem>
              <ListItem>
                {loading && <CircularProgress></CircularProgress>}
                {error && (
                  <Typography className={classes.error}>{error}</Typography>
                )}
              </ListItem>
              <ListItem>
                <form
                  onSubmit={handleSubmit(submitHandler)}
                  className={classes.form}
                >
                  <List>
                    <ListItem>
                      <Controller
                        name="name"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="name"
                            label="Name"
                            error={Boolean(errors.name)}
                            helperText={errors.name ? 'Name is Required' : ''}
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>

                    <ListItem>
                      <Controller
                        name="slug"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="slug"
                            label="Slug"
                            error={Boolean(errors.slug)}
                            helperText={errors.slug ? 'Slug is Required' : ''}
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>

                    <ListItem>
                      <Controller
                        name="price"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="price"
                            label="Price"
                            error={Boolean(errors.price)}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <AttachMoneyIcon sx={{ mr: 1 }} />
                                </InputAdornment>
                              ),
                            }}
                            helperText={errors.price ? 'Price is Required' : ''}
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>

                    <ListItem>
                      <Controller
                        name="image"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="image"
                            label="Image"
                            error={Boolean(errors.image)}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <LinkIcon sx={{ mr: 1 }} />
                                </InputAdornment>
                              ),
                            }}
                            helperText={errors.image ? 'Image is Required' : ''}
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Button
                        variant="contained"
                        color="secondary"
                        component="label"
                      >
                        Upload File
                        <input
                          type="file"
                          onChange={(e) => uploadHandler(e)}
                          hidden
                        />
                      </Button>
                      {loadingUploadImage && <CircularProgress />}
                    </ListItem>

                    <ListItem>
                      <FormControlLabel
                        label="Featured Product"
                        control={
                          <Checkbox
                            onClick={(e) => setIsFeatured(e.target.checked)}
                            checked={isFeatured}
                            name="isFeatured"
                          />
                        }
                      ></FormControlLabel>
                    </ListItem>

                    <ListItem>
                      <Controller
                        name="featuredImage"
                        control={control}
                        defaultValue=""
                        deps="isFeatured"
                        rules={{
                          validate: (value) =>
                            (isFeatured === true && value !== '') ||
                            isFeatured === false ||
                            `Featured Image is Required while 'Featured Product' is Selected`,
                        }}
                        //Rules:
                        //1. If isFeatured is 'true' then the value of featuredImage should not be empty
                        //2. If isFeatured is 'false' then the value of featuredImage can be either empty or given
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="featuredImage"
                            label="Featured Image"
                            error={Boolean(errors.featuredImage)}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <LinkIcon sx={{ mr: 1 }} />
                                </InputAdornment>
                              ),
                            }}
                            helperText={
                              errors.featuredImage
                                ? `Featured Image is Required while 'Featured Product' is Selected`
                                : ''
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Button
                        variant="contained"
                        color="secondary"
                        component="label"
                      >
                        Upload File
                        <input
                          type="file"
                          onChange={(e) => uploadHandler(e, 'featuredImage')}
                          hidden
                        />
                      </Button>
                      {loadingUploadFeaturedImage && <CircularProgress />}
                    </ListItem>

                    <ListItem>
                      <Controller
                        name="category"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="category"
                            label="Category"
                            error={Boolean(errors.category)}
                            helperText={
                              errors.category ? 'Category is Required' : ''
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>

                    <ListItem>
                      <Controller
                        name="brand"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="brand"
                            label="Brand"
                            error={Boolean(errors.brand)}
                            helperText={errors.brand ? 'Brand is Required' : ''}
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>

                    <ListItem>
                      <Controller
                        name="countInStock"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="countInStock"
                            label="Count In Stock"
                            error={Boolean(errors.countInStock)}
                            helperText={
                              errors.countInStock
                                ? 'Count In Stock is Required'
                                : ''
                            }
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <NumbersIcon sx={{ mr: 1 }} />
                                </InputAdornment>
                              ),
                            }}
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>

                    <ListItem>
                      <Controller
                        name="description"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="description"
                            label="Description"
                            error={Boolean(errors.description)}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <DriveFileRenameOutlineIcon sx={{ mr: 1 }} />
                                </InputAdornment>
                              ),
                            }}
                            helperText={
                              errors.description
                                ? 'Description is Required'
                                : ''
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>

                    <ListItem>
                      <Button
                        variant="contained"
                        type="submit"
                        fullWidth
                        color="primary"
                      >
                        Update
                      </Button>
                      {loadingUpdate && <CircularProgress></CircularProgress>}
                    </ListItem>
                  </List>
                </form>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export async function getServerSideProps({ params }) {
  return {
    props: { params },
  };
}
//Dynamic is used when we do not want something rendered on Server-Side
//Instead we want it on Client-Side where SEO does not matter, Product Edit Page does not need to be Indexed, it is Admin only
export default dynamic(() => Promise.resolve(ProductEdit), { ssr: false });
