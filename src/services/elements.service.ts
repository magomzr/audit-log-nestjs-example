import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import type { Db } from 'src/db';
import { elements } from 'src/db/schema';
import { CreateElementDto, UpdateElementDto } from 'src/entities/element';

@Injectable()
export class ElementsService {
  constructor(@Inject('DB') private readonly db: Db) {}

  findAll() {
    return this.db.select().from(elements);
  }

  async findOne(id: string) {
    const row = await this.db.query.elements.findFirst({
      where: eq(elements.id, id),
    });
    if (!row) throw new NotFoundException(`Element ${id} not found`);
    return row;
  }

  async create(dto: CreateElementDto, userId: string) {
    const [row] = await this.db
      .insert(elements)
      .values({
        id: randomUUID(),
        name: dto.name,
        description: dto.description ?? '',
        createdBy: userId,
      })
      .returning();
    return row;
  }

  async update(id: string, dto: UpdateElementDto) {
    const before = await this.findOne(id);
    const [after] = await this.db
      .update(elements)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(elements.id, id))
      .returning();
    return { before, after };
  }

  async publish(id: string) {
    const before = await this.findOne(id);
    const [after] = await this.db
      .update(elements)
      .set({ status: 'published', updatedAt: new Date() })
      .where(eq(elements.id, id))
      .returning();
    return { before, after };
  }

  async remove(id: string) {
    const before = await this.findOne(id);
    await this.db.delete(elements).where(eq(elements.id, id));
    return { before, after: { deleted: true, id } };
  }
}
