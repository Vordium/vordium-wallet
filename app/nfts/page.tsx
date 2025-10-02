'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, RefreshIcon, FilterIcon, GridIcon, ListIcon, EyeIcon } from '@/components/icons/GrayIcons';
import { useWalletStore } from '@/store/walletStore';
import { PageSkeleton } from '@/components/ui/Skeleton';

interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  collection: string;
  contractAddress: string;
  tokenId: string;
  chain: 'Ethereum' | 'Tron';
  floorPrice?: number;
  lastSale?: number;
  rarity?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

function NFTsPageContent() {
  const router = useRouter();
  const { accounts } = useWalletStore();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'ethereum' | 'tron'>('all');
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const evmAccount = accounts.find(a => a.chain === 'EVM');
  const tronAccount = accounts.find(a => a.chain === 'TRON');

  useEffect(() => {
    loadNFTs();
  }, [evmAccount, tronAccount]);

  const loadNFTs = async () => {
    if (!evmAccount || !tronAccount) return;
    
    setLoading(true);
    try {
      // Mock NFT data - in production, this would fetch from OpenSea, Rarible, etc.
      const mockNFTs: NFT[] = [
        {
          id: '1',
          name: 'Bored Ape #1234',
          description: 'A unique Bored Ape from the famous collection',
          image: 'https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=BAYC',
          collection: 'Bored Ape Yacht Club',
          contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
          tokenId: '1234',
          chain: 'Ethereum',
          floorPrice: 15.5,
          lastSale: 12.3,
          rarity: 'Rare',
          attributes: [
            { trait_type: 'Background', value: 'Blue' },
            { trait_type: 'Eyes', value: 'Bored' },
            { trait_type: 'Fur', value: 'Brown' },
            { trait_type: 'Mouth', value: 'Grin' }
          ]
        },
        {
          id: '2',
          name: 'CryptoPunk #5678',
          description: 'One of the original 10,000 CryptoPunks',
          image: 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=CP',
          collection: 'CryptoPunks',
          contractAddress: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB',
          tokenId: '5678',
          chain: 'Ethereum',
          floorPrice: 45.2,
          lastSale: 38.7,
          rarity: 'Legendary',
          attributes: [
            { trait_type: 'Type', value: 'Alien' },
            { trait_type: 'Accessories', value: 'None' },
            { trait_type: 'Eyes', value: 'Regular' }
          ]
        },
        {
          id: '3',
          name: 'TRON NFT #999',
          description: 'A unique NFT on the TRON blockchain',
          image: 'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=TRON',
          collection: 'TRON Collection',
          contractAddress: 'TXYZabcdef1234567890',
          tokenId: '999',
          chain: 'Tron',
          floorPrice: 0.5,
          lastSale: 0.3,
          rarity: 'Common',
          attributes: [
            { trait_type: 'Color', value: 'Orange' },
            { trait_type: 'Shape', value: 'Circle' }
          ]
        },
        {
          id: '4',
          name: 'Art Block #456',
          description: 'Generative art piece from Art Blocks',
          image: 'https://via.placeholder.com/300x300/EF4444/FFFFFF?text=AB',
          collection: 'Art Blocks',
          contractAddress: '0xa7d8d9ef8D8Ce8992Df33D8b8CF4Aebabd5bD270',
          tokenId: '456',
          chain: 'Ethereum',
          floorPrice: 2.1,
          lastSale: 1.8,
          rarity: 'Uncommon',
          attributes: [
            { trait_type: 'Algorithm', value: 'Fidenza' },
            { trait_type: 'Complexity', value: 'High' }
          ]
        }
      ];
      
      setNfts(mockNFTs);
    } catch (error) {
      console.error('Failed to load NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNFTs = nfts.filter(nft => {
    if (filter === 'all') return true;
    if (filter === 'ethereum') return nft.chain === 'Ethereum';
    if (filter === 'tron') return nft.chain === 'Tron';
    return true;
  });

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `${price.toFixed(2)} ETH`;
    } else {
      return `${(price * 1000).toFixed(0)} Gwei`;
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">My NFTs</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(true)}
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 transition"
          >
            <FilterIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 transition"
          >
            {viewMode === 'grid' ? <ListIcon className="w-5 h-5" /> : <GridIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{nfts.length}</div>
            <div className="text-gray-400 text-sm">Total NFTs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {nfts.filter(nft => nft.chain === 'Ethereum').length}
            </div>
            <div className="text-gray-400 text-sm">Ethereum</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {nfts.filter(nft => nft.chain === 'Tron').length}
            </div>
            <div className="text-gray-400 text-sm">TRON</div>
          </div>
        </div>
      </div>

      {/* NFT Grid/List */}
      {filteredNFTs.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-gray-400 text-lg mb-2">No NFTs found</div>
          <div className="text-gray-500 text-sm">Your NFTs will appear here</div>
        </div>
      ) : (
        <div className={`p-4 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}`}>
          {filteredNFTs.map((nft) => (
            <div
              key={nft.id}
              onClick={() => setSelectedNFT(nft)}
              className={`bg-gray-800 rounded-2xl overflow-hidden hover:bg-gray-700 transition cursor-pointer ${
                viewMode === 'list' ? 'flex gap-4 p-4' : ''
              }`}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="aspect-square relative">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/300x300/374151/9CA3AF?text=NFT';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className="text-xs px-2 py-1 bg-gray-900/80 text-white rounded-full">
                        {nft.chain}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white truncate">{nft.name}</h3>
                    <p className="text-gray-400 text-sm truncate">{nft.collection}</p>
                    {nft.floorPrice && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-400">Floor: </span>
                        <span className="text-white font-medium">{formatPrice(nft.floorPrice)}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/80x80/374151/9CA3AF?text=NFT';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{nft.name}</h3>
                    <p className="text-gray-400 text-sm truncate">{nft.collection}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">
                        {nft.chain}
                      </span>
                      {nft.floorPrice && (
                        <span className="text-white font-medium">{formatPrice(nft.floorPrice)}</span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">NFT Details</h3>
              <button
                onClick={() => setSelectedNFT(null)}
                className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-600 transition"
              >
                <ArrowLeftIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden">
                <img
                  src={selectedNFT.image}
                  alt={selectedNFT.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x400/374151/9CA3AF?text=NFT';
                  }}
                />
              </div>
              
              <div>
                <h4 className="text-xl font-bold text-white mb-1">{selectedNFT.name}</h4>
                <p className="text-gray-400 text-sm mb-2">{selectedNFT.collection}</p>
                <p className="text-gray-300 text-sm">{selectedNFT.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {selectedNFT.floorPrice && (
                  <div className="bg-gray-700 rounded-xl p-3">
                    <div className="text-gray-400 text-sm">Floor Price</div>
                    <div className="text-white font-semibold">{formatPrice(selectedNFT.floorPrice)}</div>
                  </div>
                )}
                {selectedNFT.lastSale && (
                  <div className="bg-gray-700 rounded-xl p-3">
                    <div className="text-gray-400 text-sm">Last Sale</div>
                    <div className="text-white font-semibold">{formatPrice(selectedNFT.lastSale)}</div>
                  </div>
                )}
              </div>
              
              {selectedNFT.attributes && selectedNFT.attributes.length > 0 && (
                <div>
                  <h5 className="text-white font-semibold mb-3">Attributes</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedNFT.attributes.map((attr, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-2">
                        <div className="text-gray-400 text-xs">{attr.trait_type}</div>
                        <div className="text-white text-sm font-medium">{attr.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition">
                  View on Explorer
                </button>
                <button className="flex-1 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition">
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-600 transition"
              >
                <ArrowLeftIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-3 block">Chain</label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Chains' },
                    { value: 'ethereum', label: 'Ethereum' },
                    { value: 'tron', label: 'TRON' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilter(option.value as any);
                        setShowFilters(false);
                      }}
                      className={`w-full text-left py-2 px-3 rounded-lg transition ${
                        filter === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NFTsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NFTsPageContent />
    </Suspense>
  );
}
