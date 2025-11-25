import React, { memo, useEffect, useRef, useState } from 'react';
import {
  Card,
  Select,
  Table,
  Row,
  Col,
  Button,
  Tag,
  Image,
  Dialog,
  Form,
  Input,
  InputNumber,
  Switch,
  MessagePlugin,
  Radio,
} from 'tdesign-react';
import classnames from 'classnames';
import {
  getProductCategories,
  getProductList,
  ProductCategory,
  ProductListItem,
  ProductListParams,
  createProduct,
  updateProduct,
  deleteProduct,
  ProductPayload,
  ProductDetail,
  ProductImageDetail,
  getProductDetail,
} from 'services/backend';
import CommonStyle from 'styles/common.module.less';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { FormInstanceFunctions, SubmitContext } from 'tdesign-react/es/form/type';

const { Option } = Select;
const { FormItem } = Form;

// Sortable image row component
interface SortableImageRowProps {
  id: string;
  img: ProductImageDetail;
  index: number;
  onUpdateImage: (index: number, field: keyof ProductImageDetail, value: any) => void;
  onDeleteImage: (index: number) => void;
  onSetPrimaryImage: (index: number) => void;
}

const SortableImageRow: React.FC<SortableImageRowProps> = ({
  id,
  img,
  index,
  onUpdateImage,
  onDeleteImage,
  onSetPrimaryImage,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        marginBottom: 16,
        padding: '16px',
        border: '1px solid #e7e7e7',
        borderRadius: '8px',
        backgroundColor: isDragging ? '#f9f9f9' : '#fff',
        boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* 拖拽手柄 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab',
            padding: '4px',
            color: '#999',
          }}
          {...attributes}
          {...listeners}
        >
          <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M9 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6-14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4z' />
          </svg>
        </div>

        {/* 序号 */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: img.isPrimary ? '#0052d9' : '#f0f0f0',
            color: img.isPrimary ? '#fff' : '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: '14px',
            flexShrink: 0,
          }}
        >
          {index + 1}
        </div>

        {/* 图片预览 */}
        <div style={{ flexShrink: 0 }}>
          {img.url ? (
            <Image
              src={img.url}
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'cover',
                borderRadius: '6px',
                border: '1px solid #e7e7e7',
              }}
              fit='cover'
            />
          ) : (
            <div
              style={{
                width: '100px',
                height: '100px',
                border: '2px dashed #ddd',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#bbb',
                fontSize: '12px',
                backgroundColor: '#fafafa',
              }}
            >
              无图片
            </div>
          )}
        </div>

        {/* URL 输入框 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Input
            value={img.url}
            placeholder='请输入图片 URL'
            onChange={(value) => onUpdateImage(index, 'url', value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* 主图标记 */}
        <div style={{ flexShrink: 0 }}>
          <Radio checked={!!img.isPrimary} onChange={() => onSetPrimaryImage(index)}>
            主图
          </Radio>
        </div>

        {/* 删除按钮 */}
        <div style={{ flexShrink: 0 }}>
          <Button theme='danger' variant='outline' size='small' onClick={() => onDeleteImage(index)}>
            删除
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProductListPage = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ProductListItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [formVisible, setFormVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ProductListItem | null>(null);
  const formRef = useRef<FormInstanceFunctions>();
  const [images, setImages] = useState<ProductImageDetail[]>([]);

  const loadCategories = async () => {
    const response = await getProductCategories();
    setCategories(response.items);
  };

  const loadList = async (extraParams?: Partial<ProductListParams>) => {
    setLoading(true);
    try {
      const params: ProductListParams = {
        page,
        pageSize,
        categoryCode: selectedCategory,
        ...extraParams,
      };
      const res = await getProductList(params);
      setList(res.data || []);
      const pagination = res.meta?.pagination;
      if (pagination) {
        setPage(pagination.page);
        setPageSize(pagination.pageSize);
        setTotal(pagination.total);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadList({ page: 1 });
  }, []);

  const handleSearch = () => {
    setPage(1);
    loadList({ page: 1 });
  };

  const handleAdd = () => {
    setEditing(null);
    setImages([]);
    setFormVisible(true);
  };

  const handleEdit = async (record: ProductListItem) => {
    setEditing(record);
    setFormVisible(true);
    try {
      const detail: ProductDetail = await getProductDetail(record.id);
      const detailImages = (detail.images || []).map((img, index) => ({
        ...img,
        sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : index,
        isPrimary: typeof img.isPrimary === 'boolean' ? img.isPrimary : index === 0,
      }));
      setImages(detailImages);
    } catch (e) {
      setImages([]);
      MessagePlugin.error('加载产品详情失败');
    }
  };

  const handleDelete = async (record: ProductListItem) => {
    try {
      setLoading(true);
      await deleteProduct(record.id);
      MessagePlugin.success('删除成功');
      loadList({ page: 1 });
    } catch (e) {
      MessagePlugin.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (ctx: SubmitContext) => {
    if (ctx.validateResult !== true) return;

    const values = formRef.current?.getFieldsValue?.(true) as any;
    const basePayload: Partial<ProductPayload> = {
      categoryCode: values.categoryCode,
      name: values.name,
      sku: values.sku,
      basePrice: Number(values.basePrice),
      currency: values.currency,
      defaultImageUrl: values.defaultImageUrl,
      availableColors: values.availableColors
        ? String(values.availableColors)
            .split(',')
            .map((v: string) => v.trim())
            .filter((v: string) => v)
        : [],
      minCarat: values.minCarat !== undefined ? Number(values.minCarat) : undefined,
      maxCarat: values.maxCarat !== undefined ? Number(values.maxCarat) : undefined,
      isCustomizable: values.isCustomizable,
    };

    const normalizedImages = images
      .filter((img) => img.url)
      .map((img, index) => ({
        imageUrl: img.url,
        altText: '',
        sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : index,
        isPrimary: !!img.isPrimary,
      }));

    try {
      setSaving(true);
      if (editing) {
        // 更新时 description 可选，如果留空则不覆盖原值
        const updatePayload: Partial<ProductPayload> = {
          ...basePayload,
          images: normalizedImages,
        };
        if (values.description) {
          updatePayload.description = values.description;
        }
        await updateProduct(editing.id, updatePayload);
        MessagePlugin.success('更新成功');
      } else {
        const createPayload: ProductPayload = {
          ...(basePayload as ProductPayload),
          description: values.description,
          images: normalizedImages,
        };
        if (!createPayload.description) {
          MessagePlugin.error('请输入描述');
          setSaving(false);
          return;
        }
        await createProduct(createPayload);
        MessagePlugin.success('创建成功');
      }
      setFormVisible(false);
      loadList({ page: 1 });
    } catch (e) {
      MessagePlugin.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = () => {
    setImages((prev) => {
      const nextIndex = prev.length;
      return [
        ...prev,
        {
          url: '',
          sortOrder: nextIndex,
          isPrimary: prev.length === 0,
        },
      ];
    });
  };

  const handleUpdateImage = (index: number, field: keyof ProductImageDetail, value: any) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return next;
    });
  };

  const handleDeleteImage = (index: number) => {
    setImages((prev) => {
      const next = prev
        .filter((_, i) => i !== index)
        .map((img, i) => ({
          ...img,
          sortOrder: i,
        }));
      if (next.length > 0 && !next.some((img) => img.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setImages((prev) => {
      const oldIndex = prev.findIndex((_, i) => `image-${i}` === active.id);
      const newIndex = prev.findIndex((_, i) => `image-${i}` === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      // Update sortOrder based on new position
      return reordered.map((img, i) => ({ ...img, sortOrder: i }));
    });
  };

  const columns = [
    {
      colKey: 'categoryName',
      title: '类型',
      width: 140,
    },
    {
      colKey: 'image',
      title: '图片',
      width: 120,
      cell({ row }: { row: ProductListItem }) {
        if (!row.image) return '-';
        return <Image src={row.image} style={{ width: 80, height: 80, objectFit: 'cover' }} fit='cover' />;
      },
    },
    {
      colKey: 'name',
      title: '名称',
      width: 220,
    },
    {
      colKey: 'sku',
      title: 'SKU',
      width: 180,
    },
    {
      colKey: 'price',
      title: '价格',
      width: 140,
      cell({ row }: { row: ProductListItem }) {
        return `${row.price} ${row.currency || ''}`;
      },
    },
    {
      colKey: 'colors',
      title: '可选颜色',
      ellipsis: true,
      cell({ row }: { row: ProductListItem }) {
        if (!row.colors || row.colors.length === 0) return '-';
        return (
          <>
            {row.colors.map((color) => (
              <Tag key={color} shape='round' variant='light-outline'>
                {color}
              </Tag>
            ))}
          </>
        );
      },
    },
    {
      colKey: 'caratRange',
      title: '适配克拉范围',
      width: 200,
      cell({ row }: { row: ProductListItem }) {
        if (row.minCarat === undefined && row.maxCarat === undefined) return '-';
        const min = row.minCarat ?? '?';
        const max = row.maxCarat ?? '?';
        return `${min} ~ ${max} ct`;
      },
    },
    {
      colKey: 'isCustomizable',
      title: '是否可定制',
      width: 120,
      cell({ row }: { row: ProductListItem }) {
        if (row.isCustomizable === undefined) return '-';
        return row.isCustomizable ? (
          <Tag theme='success' variant='light'>
            可定制
          </Tag>
        ) : (
          <Tag theme='default' variant='outline'>
            固定款
          </Tag>
        );
      },
    },
    {
      colKey: 'op',
      title: '操作',
      width: 180,
      cell({ row }: { row: ProductListItem }) {
        return (
          <>
            <Button theme='primary' variant='text' onClick={() => handleEdit(row)}>
              编辑
            </Button>
            <Button theme='danger' variant='text' onClick={() => handleDelete(row)}>
              删除
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <div className={classnames(CommonStyle.pageWithPadding, CommonStyle.pageWithColor)}>
      <Card title='产品筛选' bordered={false}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div>
              <span style={{ marginRight: 8 }}>产品类型：</span>
              <Select
                clearable
                placeholder='请选择产品类型'
                value={selectedCategory}
                style={{ width: 240 }}
                onChange={(value) => setSelectedCategory(value as string)}
              >
                {categories.map((item) => (
                  <Option key={item.code} value={item.code} label={item.name} />
                ))}
              </Select>
            </div>
          </Col>
          <Col span={24}>
            <Button theme='primary' onClick={handleSearch}>
              查询
            </Button>
          </Col>
        </Row>
      </Card>

      <Card
        style={{ marginTop: 16 }}
        title='产品列表'
        bordered={false}
        actions={
          <Button theme='primary' onClick={handleAdd}>
            新增产品
          </Button>
        }
      >
        <Table
          rowKey='id'
          loading={loading}
          data={list}
          columns={columns}
          pagination={{
            pageSize,
            current: page,
            total,
            showJumper: true,
            onCurrentChange: (current, pageInfo) => {
              setPage(current);
              setPageSize(pageInfo.pageSize);
              loadList({
                page: current,
                pageSize: pageInfo.pageSize,
              });
            },
            onPageSizeChange: (size) => {
              setPage(1);
              setPageSize(size);
              loadList({
                page: 1,
                pageSize: size,
              });
            },
          }}
        />
      </Card>

      <Dialog
        header={editing ? '编辑产品' : '新增产品'}
        visible={formVisible}
        confirmBtn={{ content: '保存', loading: saving }}
        cancelBtn='取消'
        onClose={() => setFormVisible(false)}
        onConfirm={() => formRef.current?.submit?.()}
        width='700px'
      >
        <Form ref={formRef} labelWidth={100} onSubmit={onSubmit} colon key={editing ? editing.id : 'new'}>
          <FormItem
            label='产品类型'
            name='categoryCode'
            initialData={editing?.categoryCode || selectedCategory}
            rules={[{ required: true, message: '请选择产品类型', type: 'error' }]}
          >
            <Select placeholder='请选择产品类型'>
              {categories.map((item) => (
                <Option key={item.code} value={item.code} label={item.name} />
              ))}
            </Select>
          </FormItem>

          <FormItem
            label='名称'
            name='name'
            initialData={editing?.name}
            rules={[{ required: true, message: '请输入产品名称', type: 'error' }]}
          >
            <Input placeholder='请输入产品名称' />
          </FormItem>

          <FormItem
            label='SKU'
            name='sku'
            initialData={editing?.sku}
            rules={[{ required: true, message: '请输入 SKU', type: 'error' }]}
          >
            <Input placeholder='例如 243Q-DP-R-YG-14' />
          </FormItem>

          <Row gutter={[16, 16]}>
            <Col span={6}>
              <FormItem
                label='基础价格'
                name='basePrice'
                initialData={editing?.price}
                rules={[{ required: true, message: '请输入价格', type: 'error' }]}
              >
                <InputNumber min={0} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label='币种'
                name='currency'
                initialData={editing?.currency || 'USD'}
                rules={[{ required: true, message: '请输入币种', type: 'error' }]}
              >
                <Input placeholder='例如 USD' />
              </FormItem>
            </Col>
          </Row>

          <FormItem
            label='封面图片 URL'
            name='defaultImageUrl'
            initialData={editing?.image}
            rules={[{ required: true, message: '请输入图片地址', type: 'error' }]}
          >
            <Input placeholder='请输入图片地址' />
          </FormItem>

          <FormItem label='可选颜色' name='availableColors' initialData={editing?.colors?.join(',')}>
            <Input placeholder='以英文逗号分隔，例如 white,yellow,rose' />
          </FormItem>

          <Row gutter={[16, 16]}>
            <Col span={6}>
              <FormItem label='最小克拉' name='minCarat' initialData={editing?.minCarat}>
                <InputNumber min={0} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label='最大克拉' name='maxCarat' initialData={editing?.maxCarat}>
                <InputNumber min={0} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label='可定制' name='isCustomizable' initialData={editing?.isCustomizable ?? true}>
                <Switch />
              </FormItem>
            </Col>
          </Row>

          <FormItem label='描述' name='description'>
            <Input placeholder='请输入产品描述' />
          </FormItem>

          <FormItem label='图片管理'>
            <div style={{ width: '100%' }}>
              {images.length === 0 ? (
                <div style={{ marginBottom: 12, color: '#999' }}>暂无图片，请点击下方"新增图片"按钮添加。</div>
              ) : (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={images.map((_, i) => `image-${i}`)} strategy={verticalListSortingStrategy}>
                    {images.map((img, index) => (
                      <SortableImageRow
                        key={`image-${index}`}
                        id={`image-${index}`}
                        img={img}
                        index={index}
                        onUpdateImage={handleUpdateImage}
                        onDeleteImage={handleDeleteImage}
                        onSetPrimaryImage={handleSetPrimaryImage}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
              <Button theme='primary' variant='outline' size='small' onClick={handleAddImage}>
                新增图片
              </Button>
            </div>
          </FormItem>
        </Form>
      </Dialog>
    </div>
  );
};

export default memo(ProductListPage);
