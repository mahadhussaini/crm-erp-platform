"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials, formatCurrency, getStatusColor } from "@/lib/utils"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { LeadStatus, Priority } from "@prisma/client"

interface Lead {
  id: string
  title: string
  value: number
  status: LeadStatus
  priority: Priority
  source: string
  contact: {
    firstName: string
    lastName: string
    email: string
  }
  company: {
    name: string
  }
  assignedTo: {
    name: string
    image?: string
  }
  createdAt: Date
}

interface LeadsKanbanProps {
  leads: Lead[]
  onLeadUpdate: (leadId: string, status: LeadStatus) => void
}

const columns: { id: LeadStatus; title: string; color: string }[] = [
  { id: 'NEW', title: 'New Leads', color: 'bg-purple-100' },
  { id: 'CONTACTED', title: 'Contacted', color: 'bg-blue-100' },
  { id: 'QUALIFIED', title: 'Qualified', color: 'bg-orange-100' },
  { id: 'CONVERTED', title: 'Converted', color: 'bg-green-100' },
  { id: 'LOST', title: 'Lost', color: 'bg-red-100' },
]

interface SortableLeadCardProps {
  lead: Lead
}

function SortableLeadCard({ lead }: SortableLeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-lg border shadow-sm cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-sm line-clamp-2">{lead.title}</h4>
        <Badge variant="outline" className={getStatusColor(lead.priority.toLowerCase())}>
          {lead.priority}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {getInitials(`${lead.contact.firstName} ${lead.contact.lastName}`)}
            </AvatarFallback>
          </Avatar>
          <div className="text-xs">
            <p className="font-medium">{lead.contact.firstName} {lead.contact.lastName}</p>
            <p className="text-gray-500">{lead.company.name}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-green-600">
            {formatCurrency(lead.value)}
          </span>
          <span className="text-xs text-gray-500">{lead.source}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={lead.assignedTo.image} />
            <AvatarFallback className="text-xs">
              {getInitials(lead.assignedTo.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-gray-600">{lead.assignedTo.name}</span>
        </div>
      </div>
    </div>
  )
}

export function LeadsKanban({ leads, onLeadUpdate }: LeadsKanbanProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const [, setActiveId] = useState<string | null>(null)
  const [items, setItems] = useState(() => {
    const grouped: Record<LeadStatus, Lead[]> = {
      NEW: [],
      CONTACTED: [],
      QUALIFIED: [],
      CONVERTED: [],
      LOST: [],
    }

    leads.forEach(lead => {
      if (grouped[lead.status]) {
        grouped[lead.status].push(lead)
      }
    })

    return grouped
  })

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id

    // Find which column the dragged item is coming from and going to
    const sourceColumn = Object.keys(items).find(column =>
      items[column as LeadStatus].some(lead => lead.id === activeId)
    ) as LeadStatus

    const destinationColumn = overId in items ? overId : Object.keys(items).find(column =>
      items[column as LeadStatus].some(lead => lead.id === overId)
    ) as LeadStatus

    if (!sourceColumn || !destinationColumn) return

    if (sourceColumn === destinationColumn) {
      // Reordering within the same column
      const oldIndex = items[sourceColumn].findIndex(lead => lead.id === activeId)
      const newIndex = items[sourceColumn].findIndex(lead => lead.id === overId)

      setItems(prev => ({
        ...prev,
        [sourceColumn]: arrayMove(prev[sourceColumn], oldIndex, newIndex)
      }))
    } else {
      // Moving between columns
      const sourceItems = items[sourceColumn]
      const destItems = items[destinationColumn as LeadStatus]
      const sourceIndex = sourceItems.findIndex(lead => lead.id === activeId)
      const destIndex = destItems.findIndex(lead => lead.id === overId)

      const newSourceItems = [...sourceItems]
      const newDestItems = [...destItems]
      const [movedItem] = newSourceItems.splice(sourceIndex, 1)
      newDestItems.splice(destIndex, 0, movedItem)

      setItems(prev => ({
        ...prev,
        [sourceColumn]: newSourceItems,
        [destinationColumn]: newDestItems
      }))

      // Update lead status in the backend
      onLeadUpdate(activeId, destinationColumn as LeadStatus)
    }

    setActiveId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {columns.map(column => (
          <div key={column.id} className="space-y-4">
            <div className={`p-4 rounded-lg ${column.color}`}>
              <h3 className="font-semibold text-gray-900">
                {column.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {items[column.id].length} leads
              </p>
            </div>

            <SortableContext
              items={items[column.id].map(lead => lead.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3 min-h-[400px]">
                {items[column.id].map(lead => (
                  <SortableLeadCard key={lead.id} lead={lead} />
                ))}
                {items[column.id].length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No leads in this stage
                  </div>
                )}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  )
}
