import { Link } from 'react-router-dom';
import { Star, Package, Download } from 'lucide-react';

const formatConfig = {
  physical: {
    badge: { label: 'Physical Book', cls: 'text-primary bg-primary/10 border-primary/30' },
    icon: Package,
  },
  ebook: {
    badge: { label: 'E-Book', cls: 'text-secondary bg-secondary/10 border-secondary/30' },
    icon: Download,
  },
  both: {
    badge: null,
    icon: null,
  },
};

export default function BookCard({ book }) {
  const cfg = formatConfig[book.format] || {};
  const showStock = book.format === 'physical' || book.format === 'both';
  const stock = book.physicalBook?.stock ?? 0;

  return (
    <Link to={`/books/${book._id}`} className="card-hover flex flex-col h-full group">
      <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
        <img
          src={book.coverImage || '/placeholder-book.svg'}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {book.discountPrice && (
          <div className="absolute top-3 right-3 bg-red-500 text-on-surface text-xs font-bold px-2 py-1 rounded-full">
            Sale
          </div>
        )}
        {book.format === 'ebook' && (
          <div className="absolute top-3 left-3 bg-blue-500/90 text-on-surface text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Download className="w-3 h-3" /> Instant
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <span className="w-full btn-primary py-2 text-sm inline-block text-center">View Details</span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-inverse-on-surface dark:text-on-surface line-clamp-2 leading-tight">
            {book.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0 bg-neutral-high px-1.5 py-0.5 rounded text-xs">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="font-medium">{book.ratingsAverage?.toFixed(1) || '0.0'}</span>
          </div>
        </div>
        <p className="text-sm text-outline dark:text-on-surface-variant mb-3">{book.author}</p>

        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {book.format === 'both' ? (
            <>
              <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/30 flex items-center gap-0.5">
                <Package className="w-2.5 h-2.5" /> Physical
              </span>
              <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded border border-blue-400/30 flex items-center gap-0.5">
                <Download className="w-2.5 h-2.5" /> E-Book
              </span>
            </>
          ) : (
            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border flex items-center gap-0.5 ${cfg.badge?.cls}`}>
              {cfg.icon && <cfg.icon className="w-2.5 h-2.5" />}
              {cfg.badge?.label}
            </span>
          )}
        </div>

        {showStock && (
          <p className={`text-xs mb-2 ${stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stock > 0 ? `In Stock (${stock})` : 'Out of Stock'}
          </p>
        )}
        {book.format === 'ebook' && book.ebook?.fileSize && (
          <p className="text-xs text-on-surface-variant mb-2">{book.ebook.fileSize}</p>
        )}

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {book.discountPrice ? (
              <>
                <span className="text-xs text-on-surface-variant line-through">RWF {book.price.toLocaleString()}</span>
                <span className="font-bold text-primary dark:text-primary">RWF {book.discountPrice.toLocaleString()}</span>
              </>
            ) : (
              <span className="font-bold text-primary dark:text-primary">RWF {book.price.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
