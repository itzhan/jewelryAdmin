import React, { memo, useEffect, useRef, useState } from 'react';
import { Card, Table, Tag, Button, Dialog, Form, Input, InputNumber, Switch, MessagePlugin } from 'tdesign-react';
import classnames from 'classnames';
import { getStoneShapes, StoneShapeItem, createStoneShape, updateStoneShape, deleteStoneShape, StoneEnumPayload } from 'services/backend';
import CommonStyle from 'styles/common.module.less';
import { FormInstanceFunctions, SubmitContext } from 'tdesign-react/es/form/type';

const { FormItem } = Form;

const StoneShapesPage = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<StoneShapeItem[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<StoneShapeItem | null>(null);
  const formRef = useRef<FormInstanceFunctions>();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getStoneShapes();
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

  const handleEdit = (record: StoneShapeItem) => {
    setEditing(record);
    setFormVisible(true);
  };

  const handleDelete = async (record: StoneShapeItem) => {
    try {
      setLoading(true);
      await deleteStoneShape(record.id);
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
    const values = formRef.current?.getFieldsValue?.(true) as StoneEnumPayload;
    try {
      setSaving(true);
      if (editing) {
        await updateStoneShape(editing.id, values);
        MessagePlugin.success('更新成功');
      } else {
        await createStoneShape(values);
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
    { colKey: 'id', title: 'ID', width: 80 },
    { colKey: 'code', title: '编码', width: 120 },
    { colKey: 'displayName', title: '显示名称', width: 160 },
    { colKey: 'description', title: '描述', ellipsis: true },
    { colKey: 'displayOrder', title: '排序', width: 100 },
    {
      colKey: 'isActive',
      title: '是否启用',
      width: 120,
      cell({ row }: { row: StoneShapeItem }) {
        return row.isActive ? (
          <Tag theme='success' variant='light'>
            启用
          </Tag>
        ) : (
          <Tag theme='default' variant='outline'>
            停用
          </Tag>
        );
      },
    },
    {
      colKey: 'op',
      title: '操作',
      width: 180,
      cell({ row }: { row: StoneShapeItem }) {
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
        title='石头形状表（stone_shapes）'
        bordered={false}
        actions={
          <Button theme='primary' onClick={handleAdd}>
            新增形状
          </Button>
        }
      >
        <Table rowKey='id' data={list} columns={columns} loading={loading} />
      </Card>

      <Dialog
        header={editing ? '编辑石头形状' : '新增石头形状'}
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
            <Input placeholder='例如 round' />
          </FormItem>
          <FormItem
            label='显示名称'
            name='displayName'
            initialData={editing?.displayName}
            rules={[{ required: true, message: '请输入显示名称', type: 'error' }]}
          >
            <Input placeholder='例如 Round' />
          </FormItem>
          <FormItem label='描述' name='description' initialData={editing?.description}>
            <Input placeholder='可选，用于说明' />
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

export default memo(StoneShapesPage);
