export default function Hero() {
  return (
    <section className="text-center py-20 from-indigo-100 to-white rounded-2xl">
      <h1 className="text-4xl md:text-5xl font-bold text-indigo-800 mb-4">
        Discover Your Next Inspiration
      </h1>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Browse through collections of art, design, and lifestyle pieces curated for modern creators.
      </p>
      <button className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition">
        Explore Collections
      </button>
    </section>
  );
}