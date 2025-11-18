import React, { memo, useEffect, useRef, useState } from 'react';
import { Card, Table, Tag, Button, Dialog, Form, Input, InputNumber, MessagePlugin } from 'tdesign-react';
import classnames from 'classnames';
import { getProductCategories, ProductCategory, createProductCategory, updateProductCategory, deleteProductCategory } from 'services/backend';
import CommonStyle from 'styles/common.module.less';
import { FormInstanceFunctions, SubmitContext } from 'tdesign-react/es/form/type';

const { FormItem } = Form;

const ProductCategoriesPage = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ProductCategory[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const formRef = useRef<FormInstanceFunctions>();

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getProductCategories();
      setList(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const handleEdit = (record: ProductCategory) => {
    setEditing(record);
    setFormVisible(true);
  };

  const handleDelete = async (record: ProductCategory) => {
    try {
      setLoading(true);
      await deleteProductCategory(record.id);
      MessagePlugin.success('删除成功');
      fetchData();
    } catch (e) {
      MessagePlugin.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (ctx: SubmitContext) => {
    if (ctx.validateResult !== true) return;
    const values = formRef.current?.getFieldsValue?.(true) as {
      code: string;
      name: string;
      description?: string;
      displayOrder?: number;
    };

    try {
      setSaving(true);
      if (editing) {
        await updateProductCategory(editing.id, values);
        MessagePlugin.success('更新成功');
      } else {
        await createProductCategory(values);
        MessagePlugin.success('创建成功');
      }
      setFormVisible(false);
      fetchData();
    } catch (e) {
      MessagePlugin.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      colKey: 'id',
      title: 'ID',
      width: 80,
    },
    {
      colKey: 'displayOrder',
      title: '排序',
      width: 100,
    },
    {
      colKey: 'code',
      title: '编码',
      width: 160,
    },
    {
      colKey: 'name',
      title: '名称',
      width: 200,
    },
    {
      colKey: 'description',
      title: '描述',
      ellipsis: true,
      cell({ row }: { row: ProductCategory }) {
        if (!row.description) return '-';
        return (
          <Tag shape='round' variant='light-outline'>
            {row.description}
          </Tag>
        );
      },
    },
    {
      colKey: 'op',
      title: '操作',
      width: 180,
      cell({ row }: { row: ProductCategory }) {
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
        title='产品类型列表'
        bordered={false}
        actions={
          <Button theme='primary' onClick={handleAdd}>
            新增类型
          </Button>
        }
      >
        <Table rowKey='id' data={list} columns={columns} loading={loading} />
      </Card>

      <Dialog
        header={editing ? '编辑产品类型' : '新增产品类型'}
        visible={formVisible}
        confirmBtn={{ content: '保存', loading: saving }}
        cancelBtn='取消'
        onClose={() => setFormVisible(false)}
        onConfirm={() => formRef.current?.submit?.()}
      >
        <Form
          ref={formRef}
          labelWidth={80}
          onSubmit={onSubmit}
          colon
          key={editing ? editing.id : 'new'}
        >
          <FormItem
            label='编码'
            name='code'
            initialData={editing?.code}
            rules={[{ required: true, message: '请输入编码', type: 'error' }]}
          >
            <Input placeholder='例如 pendant' />
          </FormItem>
          <FormItem
            label='名称'
            name='name'
            initialData={editing?.name}
            rules={[{ required: true, message: '请输入名称', type: 'error' }]}
          >
            <Input placeholder='例如 Pendants' />
          </FormItem>
          <FormItem label='描述' name='description' initialData={editing?.description}>
            <Input placeholder='用于说明该类型' />
          </FormItem>
          <FormItem label='排序' name='displayOrder' initialData={editing?.displayOrder ?? 0}>
            <InputNumber min={0} />
          </FormItem>
        </Form>
      </Dialog>
    </div>
  );
};

export default memo(ProductCategoriesPage);
