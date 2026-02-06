import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  turbopack: {
    root: '.',
  },
};

export default withNextIntl(nextConfig);
