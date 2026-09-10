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
        sort = '-createdAt',
      } = req.query;

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
    .sort(sort)
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