import { app } from './app.js';
import { connectDB, closeDB } from './config/db.js';
import { config } from './config/env.js';
import { Product } from './models/Product.js';
import { retryDueOrderNotifications } from './services/orderNotificationService.js';

const startServer = async () => {
  try {
    await connectDB();

    if (!config.orderNotificationEmail) {
      console.error('[OrderNotifications] Set ORDER_NOTIFICATION_EMAIL or BREVO_SENDER_EMAIL to enable business owner alerts.');
    } else if (!process.env.ORDER_NOTIFICATION_EMAIL) {
      console.log('[OrderNotifications] Using the configured Brevo sender address for owner alerts.');
    }
    const notificationTimer = setInterval(() => {
      retryDueOrderNotifications().catch((error) => console.error('[OrderNotifications] Retry worker failed:', error.message));
    }, 60_000);
    notificationTimer.unref();
    retryDueOrderNotifications().catch((error) => console.error('[OrderNotifications] Initial retry scan failed:', error.message));

    // Auto-seed initial data in development if database is empty
    if (config.env !== 'production') {
      const productCount = await Product.countDocuments();
      if (productCount === 0) {
        console.log('[Ergocraft API] Empty database detected. Running initial auto-seed...');
        const { default: seed } = await import('./seeders/autoSeed.js');
        await seed();
      }
    }

    // Ensure all existing products have synchronized categories array
    try {
      const unlinkedProducts = await Product.find({
        $or: [{ categories: { $exists: false } }, { categories: { $size: 0 } }],
      });
      if (unlinkedProducts.length > 0) {
        for (const p of unlinkedProducts) {
          const rawIds = [p.category, p.subcategory, p.classification].filter(Boolean);
          const seen = new Set();
          const unique = [];
          for (const id of rawIds) {
            const s = id.toString();
            if (!seen.has(s)) {
              seen.add(s);
              unique.push(id);
            }
          }
          p.categories = unique;
          await p.save();
        }
        console.log(`[Ergocraft API] Synchronized taxonomy categories array for ${unlinkedProducts.length} product(s).`);
      }
    } catch (syncErr) {
      console.error('[Ergocraft API] Taxonomy self-heal warning:', syncErr.message);
    }

    const server = app.listen(config.port, () => {
      console.log(`[Ergocraft API] Server listening on http://localhost:${config.port} in ${config.env} mode`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[Ergocraft API] Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        clearInterval(notificationTimer);
        await closeDB();
        console.log('[Ergocraft API] Process exited cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('[Ergocraft API] Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
