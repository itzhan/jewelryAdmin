import React, { memo, useEffect, useRef, useState } from 'react';
import { Card, Table, Tag, Image, Row, Col, InputNumber, Button, Dialog, Form, Input, Select, Switch, MessagePlugin } from 'tdesign-react';
import classnames from 'classnames';
import {
  getProductImages,
  ProductImageItem,
  ProductImageListParams,
  createProductImage,
  updateProductImage,
  deleteProductImage,
  ProductImagePayload,
} from 'services/backend';
import CommonStyle from 'styles/common.module.less';

import { FormInstanceFunctions, SubmitContext } from 'tdesign-react/es/form/type';

const { FormItem } = Form;
const { Option } = Select;

const ProductImagesPage = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ProductImageItem[]>([]);
  const [productIdFilter, setProductIdFilter] = useState<number | undefined>();
  const [formVisible, setFormVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ProductImageItem | null>(null);
  const formRef = useRef<FormInstanceFunctions>();

  const loadData = async (params?: ProductImageListParams) => {
    setLoading(true);
    try {
      const data = await getProductImages(params);
      setList(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = () => {
    loadData({ productId: productIdFilter });
  };

  const handleAdd = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const handleEdit = (record: ProductImageItem) => {
    setEditing(record);
    setFormVisible(true);
  };

  const handleDelete = async (record: ProductImageItem) => {
    try {
      setLoading(true);
      await deleteProductImage(record.id);
      MessagePlugin.success('删除成功');
      loadData({ productId: productIdFilter });
    } catch (e) {
      MessagePlugin.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (ctx: SubmitContext) => {
    if (ctx.validateResult !== true) return;
    const values = formRef.current?.getFieldsValue?.(true) as any;
    const payload: ProductImagePayload = {
      productId: Number(values.productId),
      imageUrl: values.imageUrl,
      altText: values.altText,
      badge: values.badge,
      aspectRatio: values.aspectRatio,
      sortOrder: values.sortOrder !== undefined ? Number(values.sortOrder) : undefined,
      isPrimary: values.isPrimary,
    };

    try {
      setSaving(true);
      if (editing) {
        await updateProductImage(editing.id, payload);
        MessagePlugin.success('更新成功');
      } else {
        await createProductImage(payload);
        MessagePlugin.success('创建成功');
      }
      setFormVisible(false);
      loadData({ productId: productIdFilter });
    } catch (e) {
      MessagePlugin.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { colKey: 'id', title: 'ID', width: 80 },
    { colKey: 'productId', title: '产品ID', width: 100 },
    { colKey: 'productName', title: '产品名称', width: 200 },
    {
      colKey: 'imageUrl',
      title: '图片',
      width: 140,
      cell({ row }: { row: ProductImageItem }) {
        return <Image src={row.imageUrl} style={{ width: 96, height: 96, objectFit: 'cover' }} fit='cover' />;
      },
    },
    { colKey: 'altText', title: 'ALT 文本', width: 220, ellipsis: true },
    { colKey: 'badge', title: '角标文案', width: 160 },
    {
      colKey: 'aspectRatio',
      title: '比例',
      width: 100,
      cell({ row }: { row: ProductImageItem }) {
        return (
          <Tag theme='default' variant='outline'>
            {row.aspectRatio}
          </Tag>
        );
      },
    },
    { colKey: 'sortOrder', title: '排序', width: 80 },
    {
      colKey: 'isPrimary',
      title: '是否主图',
      width: 120,
      cell({ row }: { row: ProductImageItem }) {
        return row.isPrimary ? (
          <Tag theme='success' variant='light'>
            主图
          </Tag>
        ) : (
          <Tag theme='default' variant='outline'>
            否
          </Tag>
        );
      },
    },
    {
      colKey: 'createdAt',
      title: '创建时间',
      width: 180,
      cell({ row }: { row: ProductImageItem }) {
        return new Date(row.createdAt).toLocaleString();
      },
    },
    {
      colKey: 'op',
      title: '操作',
      width: 180,
      cell({ row }: { row: ProductImageItem }) {
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
      <Card
        title='产品图片表（product_images）'
        bordered={false}
        actions={
          <Button theme='primary' onClick={handleAdd}>
            新增图片
          </Button>
        }
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <span style={{ marginRight: 8 }}>按产品ID筛选：</span>
            <InputNumber
              placeholder='输入产品ID'
              value={productIdFilter}
              style={{ width: 200, marginRight: 8 }}
              onChange={(value) => setProductIdFilter(value as number)}
            />
            <Button theme='primary' onClick={handleSearch}>
              查询
            </Button>
          </Col>
        </Row>
        <Table rowKey='id' data={list} columns={columns} loading={loading} />
      </Card>
      <Dialog
        header={editing ? '编辑产品图片' : '新增产品图片'}
        visible={formVisible}
        confirmBtn={{ content: '保存', loading: saving }}
        cancelBtn='取消'
        onClose={() => setFormVisible(false)}
        onConfirm={() => formRef.current?.submit?.()}
        width='700px'
      >
        <Form
          ref={formRef}
          labelWidth={100}
          onSubmit={onSubmit}
          colon
          key={editing ? editing.id : 'new'}
        >
          <FormItem
            label='产品ID'
            name='productId'
            initialData={editing?.productId || productIdFilter}
            rules={[{ required: true, message: '请输入产品ID', type: 'error' }]}
          >
            <InputNumber min={1} />
          </FormItem>
          <FormItem
            label='图片地址'
            name='imageUrl'
            initialData={editing?.imageUrl}
            rules={[{ required: true, message: '请输入图片地址', type: 'error' }]}
          >
            <Input placeholder='请输入图片 URL' />
          </FormItem>
          <FormItem
            label='ALT 文本'
            name='altText'
            initialData={editing?.altText}
            rules={[{ required: true, message: '请输入 ALT 文本', type: 'error' }]}
          >
            <Input />
          </FormItem>
          <FormItem label='角标文案' name='badge' initialData={editing?.badge}>
            <Input placeholder='可选，例如 Shown with 2 ct' />
          </FormItem>
          <FormItem
            label='比例'
            name='aspectRatio'
            initialData={editing?.aspectRatio || 'square'}
            rules={[{ required: true, message: '请选择比例', type: 'error' }]}
          >
            <Select>
              <Option value='square' label='square' />
              <Option value='portrait' label='portrait' />
            </Select>
          </FormItem>
          <FormItem label='排序' name='sortOrder' initialData={editing?.sortOrder ?? 0}>
            <InputNumber min={0} />
          </FormItem>
          <FormItem label='是否主图' name='isPrimary' initialData={editing?.isPrimary ?? false}>
            <Switch />
          </FormItem>
        </Form>
      </Dialog>
    </div>
  );
};

export default memo(ProductImagesPage);
