import Link from "next/link"
import { Calendar, MapPin } from "lucide-react"

interface ListingCardProps {
  id: number
  title: string
  location: string
  dates: string
  price: number
  image: string
}

export function ListingCard({ id, title, location, dates, price, image }: ListingCardProps) {
  return (
    <Link href={`/listing/${id}`} className="group">
      <div className="overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:shadow-md">
        <div className="aspect-video w-full overflow-hidden">
          <img
            alt={title}
            className="object-cover w-full h-full transition-transform group-hover:scale-105"
            src={image || "/placeholder.svg"}
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg">{title}</h3>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{location}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{dates}</span>
          </div>
          <div className="mt-3 font-medium">${price}/month</div>
        </div>
      </div>
    </Link>
  )
}
