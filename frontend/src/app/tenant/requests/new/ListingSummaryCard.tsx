interface ListingSummary {
  title: string
  price: number
  address: string
}

export function ListingSummaryCard({ listing }: { listing: ListingSummary }) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <h3 className="font-semibold text-blue-900">{listing.title}</h3>
      <p className="text-sm text-blue-700">{listing.address}</p>
      <p className="mt-1 font-bold text-blue-800">{listing.price.toLocaleString('vi-VN')} VND/mo</p>
    </div>
  )
}
