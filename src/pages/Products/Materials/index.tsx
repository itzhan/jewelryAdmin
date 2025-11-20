import React, { memo, useEffect, useRef, useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Dialog,
  Form,
  Input,
  InputNumber,
  Switch,
  MessagePlugin,
  Textarea,
} from 'tdesign-react';
import classnames from 'classnames';
import { getMaterials, Material, createMaterial, updateMaterial, deleteMaterial } from 'services/backend';
import CommonStyle from 'styles/common.module.less';
import { FormInstanceFunctions, SubmitContext } from 'tdesign-react/es/form/type';

const { FormItem } = Form;

const MaterialsPage = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<Material[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [formVisible, setFormVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const formRef = useRef<FormInstanceFunctions>();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getMaterials(page, pageSize);
      setList(response.items);
      setTotal(response.meta.pagination.total);
    } catch (e) {
      console.error('Failed to fetch materials:', e);
      MessagePlugin.error('加载材料列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const handleAdd = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const handleEdit = (record: Material) => {
    setEditing(record);
    setFormVisible(true);
  };

  const handleDelete = async (record: Material) => {
    try {
      setLoading(true);
      await deleteMaterial(record.id);
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
      karat?: string;
      description?: string;
      svgIcon?: string;
      displayOrder?: number;
      isActive?: boolean;
    };

    try {
      setSaving(true);
      if (editing) {
        await updateMaterial(editing.id, values);
        MessagePlugin.success('更新成功');
      } else {
        await createMaterial(values);
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
      colKey: 'name',
      title: '名称',
      width: 200,
    },
    {
      colKey: 'code',
      title: '编码',
      width: 180,
    },
    {
      colKey: 'karat',
      title: '克拉',
      width: 100,
      cell({ row }: { row: Material }) {
        return row.karat || '-';
      },
    },
    {
      colKey: 'displayOrder',
      title: '排序',
      width: 100,
    },
    {
      colKey: 'svgIcon',
      title: 'SVG 图标',
      width: 120,
      cell({ row }: { row: Material }) {
        if (!row.svgIcon) return '-';
        return <div style={{ width: 40, height: 40 }} dangerouslySetInnerHTML={{ __html: row.svgIcon }} />;
      },
    },
    {
      colKey: 'isActive',
      title: '状态',
      width: 100,
      cell({ row }: { row: Material }) {
        return row.isActive ? (
          <Tag theme='success' variant='light'>
            启用
          </Tag>
        ) : (
          <Tag theme='default' variant='outline'>
            禁用
          </Tag>
        );
      },
    },
    {
      colKey: 'description',
      title: '描述',
      ellipsis: true,
      cell({ row }: { row: Material }) {
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
      cell({ row }: { row: Material }) {
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
        title='材料列表'
        bordered={false}
        actions={
          <Button theme='primary' onClick={handleAdd}>
            新增材料
          </Button>
        }
      >
        <Table
          rowKey='id'
          data={list}
          columns={columns}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showJumper: true,
            onChange: (pageInfo) => {
              setPage(pageInfo.current);
              setPageSize(pageInfo.pageSize);
            },
          }}
        />
      </Card>

      <Dialog
        header={editing ? '编辑材料' : '新增材料'}
        visible={formVisible}
        confirmBtn={{ content: '保存', loading: saving }}
        cancelBtn='取消'
        onClose={() => setFormVisible(false)}
        onConfirm={() => formRef.current?.submit?.()}
        width='700px'
      >
        <Form ref={formRef} labelWidth={100} onSubmit={onSubmit} colon key={editing ? editing.id : 'new'}>
          <FormItem
            label='编码'
            name='code'
            initialData={editing?.code}
            rules={[{ required: true, message: '请输入编码', type: 'error' }]}
          >
            <Input placeholder='例如 white_gold_14k' />
          </FormItem>
          <FormItem
            label='名称'
            name='name'
            initialData={editing?.name}
            rules={[{ required: true, message: '请输入名称', type: 'error' }]}
          >
            <Input placeholder='例如 White Gold' />
          </FormItem>
          <FormItem label='克拉' name='karat' initialData={editing?.karat}>
            <Input placeholder='例如 14K, 18K, PT' />
          </FormItem>
          <FormItem label='描述' name='description' initialData={editing?.description}>
            <Input placeholder='用于说明该材料' />
          </FormItem>
          <FormItem label='SVG 图标' name='svgIcon' initialData={editing?.svgIcon}>
            <Textarea placeholder='可选，SVG 代码片段，用于前端图标展示' rows={4} />
          </FormItem>
          <FormItem label='排序' name='displayOrder' initialData={editing?.displayOrder ?? 0}>
            <InputNumber min={0} />
          </FormItem>
          <FormItem label='是否启用' name='isActive' initialData={editing?.isActive ?? true}>
            <Switch />
          </FormItem>
        </Form>
      </Dialog>
    </div>
  );
};

export default memo(MaterialsPage);
