const Product = require('../models/Product');

const getImageUrl = (image) => {
  if (typeof image === 'number') {
    return `/images/perfumes/perfume${image}.jpeg`;
  }

  return image;
};

const formatProductImages = (product) => ({
  ...product,
  images: (product.images || []).map(getImageUrl),
  image360:
  typeof product.image360 === 'number'
    ? `/images/perfumes/perfume${product.image360}.jpeg`
    : product.image360,
});

const SAFE_SORT_OPTIONS = {
  '-createdAt': { createdAt: -1 },
  'createdAt': { createdAt: 1 },
  'newest': { createdAt: -1 },
  'oldest': { createdAt: 1 },
  'price': { price: 1 },
  'price_asc': { price: 1 },
  'price-asc': { price: 1 },
  '-price': { price: -1 },
  'price_desc': { price: -1 },
  'price-desc': { price: -1 },
  'name': { name: 1 },
  '-name': { name: -1 },
  'name_asc': { name: 1 },
  'name_desc': { name: -1 },
  'rating': { rating: -1 },
  '-rating': { rating: -1 },
  'featured': { featured: -1, createdAt: -1 },
  'best': { bestseller: -1, rating: -1, createdAt: -1 },
  'bestseller': { bestseller: -1, createdAt: -1 },
};

class ProductController {
  // GET /api/v1/products
  static async getProducts(req, res, next) {
    try {
      const {
        search,
        category,
        gender,
        fragranceFamily,
        featured,
        bestseller,
        minPrice,
        maxPrice,
        page = 1,
        limit = 20,
        sort,
      } = req.query;

      let sortQuery = { createdAt: -1 };
      if (sort !== undefined && sort !== '') {
        const requestedSort = typeof sort === 'string' ? sort.trim() : '';
        if (SAFE_SORT_OPTIONS[requestedSort]) {
          sortQuery = SAFE_SORT_OPTIONS[requestedSort];
        } else {
          return res.status(400).json({
            success: false,
            message: `Invalid sort parameter. Supported options are: ${Object.keys(SAFE_SORT_OPTIONS).join(', ')}`,
          });
        }
      }

      const filter = {};

      if (category) {
        filter.category = category;
      }

      if (gender) {
        filter.gender = gender;
      }

      if (fragranceFamily) {
        filter.fragranceFamily = fragranceFamily;
      }

      if (featured !== undefined) {
        filter.featured = featured === 'true';
      }

      if (bestseller !== undefined) {
        filter.bestseller = bestseller === 'true';
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};

        if (minPrice !== undefined) {
          filter.price.$gte = Number(minPrice);
        }

        if (maxPrice !== undefined) {
          filter.price.$lte = Number(maxPrice);
        }
      }

      if (search) {
        filter.$text = {
          $search: search,
        };
      }

      const pageNumber = Math.max(Number(page) || 1, 1);
      const limitNumber = Math.min(
        Math.max(Number(limit) || 20, 1),
        100
      );

      const skip = (pageNumber - 1) * limitNumber;

      const [products, total] = await Promise.all([
        Product.find(filter)
          .sort(sortQuery)
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        Product.countDocuments(filter),
      ]);

const formattedProducts = products.map(formatProductImages);

      res.status(200).json({
        success: true,
        data: formattedProducts,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          pages: Math.ceil(total / limitNumber),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/products/:slug
  static async getProductBySlug(req, res, next) {
    try {
      const product = await Product.findOne({
        slug: req.params.slug.toLowerCase(),
      }).lean();

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      return res.status(200).json({
  success: true,
  data: formatProductImages(product),
});
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/products
  static async createProduct(req, res, next) {
    try {
      const product = await Product.create(req.body);

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/products/:id
  static async updateProduct(req, res, next) {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/products/:id
  static async deleteProduct(req, res, next) {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;